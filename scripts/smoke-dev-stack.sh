#!/bin/sh
# Smoke test for the development Docker stack (docker-compose.development.yml).
#
# Starts the full dev stack from the untouched .env.development.example, exactly
# as DOCKER.md tells a newcomer to, and asserts the HTTP behaviour a user sees:
#   - GET /        redirects to /login
#   - GET /login   renders (and the i18n catalog is populated)
#   - the OIDC mock is healthy and serves its discovery document
#   - POST /login  redirects the browser to the mock IdP's authorize endpoint
# and then completes the login round trip the way a browser would (mock IdP
# callback, token exchange from inside the container, session in Postgres,
# dashboard reading FHIR data from Mockoon).
#
# Never touches a developer's own .env.development: the example file is copied to
# a temp file and injected via a compose override.
#
# Usage:
#   scripts/smoke-dev-stack.sh
#   SMOKE_WEB_PORT=5174 scripts/smoke-dev-stack.sh   # if 5173 is busy on the host
#
# Requires: docker with compose v2 (`docker compose`), curl.
set -eu

REPO_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$REPO_ROOT"

WEB_PORT=${SMOKE_WEB_PORT:-5173}
OIDC_URL=http://localhost:8080
PROJECT=phellow-community-smoke
WAIT_TIMEOUT=${SMOKE_WAIT_TIMEOUT:-300} # seconds for `compose up --wait`
APP_POLL_SECONDS=120                    # seconds to wait for Vite to answer

WORK_DIR=$(mktemp -d)
ENV_FILE="$WORK_DIR/.env.development"
OVERRIDE="$WORK_DIR/override.yml"
JAR="$WORK_DIR/cookies.txt"
cp .env.development.example "$ENV_FILE"

# ORIGIN from the env file is what the app's CSRF check compares against and
# where the mock IdP sends the browser back to. It stays on 5173 even when
# SMOKE_WEB_PORT remaps the host port, so requests go to APP_URL while headers
# and redirect targets keep using ORIGIN.
ORIGIN=$(sed -n 's/^ORIGIN=//p' "$ENV_FILE" | tr -d '"' | head -n 1)
APP_URL="http://localhost:$WEB_PORT"

cat > "$OVERRIDE" <<EOF
services:
  migrate:
    env_file: !override
      - $ENV_FILE
  web:
    env_file: !override
      - $ENV_FILE
    ports: !override
      - "$WEB_PORT:5173"
EOF

compose() {
	docker compose -p "$PROJECT" -f docker-compose.development.yml -f "$OVERRIDE" "$@"
}

cleanup() {
	status=$?
	if [ "$status" -ne 0 ]; then
		echo
		echo "===== docker compose ps ====="
		compose ps -a || true
		echo "===== logs: web ====="
		compose logs --no-color --tail=80 web || true
		echo "===== logs: oidc-mock ====="
		compose logs --no-color --tail=40 oidc-mock || true
	fi
	compose down -v --remove-orphans >/dev/null 2>&1 || true
	rm -rf "$WORK_DIR"
	if [ "$status" -ne 0 ]; then
		echo "SMOKE TEST FAILED"
		exit "$status"
	fi
	echo "SMOKE TEST PASSED"
}
trap cleanup EXIT
# dash does not run the EXIT trap on a signal unless the signal is trapped too.
trap 'exit 130' INT TERM

FAILED=0
fail() {
	echo "  FAIL: $*"
	FAILED=1
}
pass() {
	echo "  ok:   $*"
}

# One request; prints "<http_code> <redirect_url>". curl prints 000 when no
# connection could be made, so a failed request still yields a parseable line.
probe() {
	curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "$@" || true
}

echo "==> Starting dev stack (project: $PROJECT, app on $APP_URL)"
compose up --build -d --wait --wait-timeout "$WAIT_TIMEOUT"

echo "==> Waiting for the app to answer"
waited=0
until [ "$(probe "$APP_URL/")" != "000 " ]; do
	if [ "$waited" -ge "$APP_POLL_SECONDS" ]; then
		echo "App did not answer within ${APP_POLL_SECONDS}s"
		exit 1
	fi
	sleep 2
	waited=$((waited + 2))
done

echo "==> Assertions"

result=$(probe "$APP_URL/")
case "$result" in
	"307 "*/login) pass "GET / -> 307 to /login" ;;
	*) fail "GET / expected 307 to /login, got '$result'" ;;
esac

login_body="$WORK_DIR/login.html"
code=$(curl -s -o "$login_body" -w '%{http_code}' "$APP_URL/login" || true)
if [ "$code" = "200" ]; then
	pass "GET /login -> 200"
else
	fail "GET /login expected 200, got $code"
fi
if grep -Eq 'Anmelden|Login' "$login_body"; then
	pass "GET /login body contains translated text (message catalog populated)"
else
	fail "GET /login body has no translated login text; Paraglide catalog is probably empty"
fi

health=$(docker inspect --format '{{.State.Health.Status}}' "$(compose ps -q oidc-mock)" 2>/dev/null || echo unknown)
if [ "$health" = "healthy" ]; then
	pass "oidc-mock container is healthy"
else
	fail "oidc-mock container health is '$health', expected 'healthy'"
fi

result=$(probe "$OIDC_URL/.well-known/openid-configuration")
case "$result" in
	"200 "*) pass "OIDC discovery document served on $OIDC_URL" ;;
	*) fail "OIDC discovery expected 200, got '$result'" ;;
esac

# Full login round trip, the way a browser does it. A browser form post sends
# Accept: text/html; without it SvelteKit answers the action with JSON.
result=$(probe -c "$JAR" -X POST -H "Accept: text/html" -H "Origin: $ORIGIN" -d '' "$APP_URL/login?/login")
case "$result" in
	"303 $OIDC_URL/"*authorize*) pass "POST /login -> 303 to mock IdP authorize endpoint on localhost" ;;
	*) fail "POST /login expected 303 to $OIDC_URL/...authorize..., got '$result'" ;;
esac
authorize_url=${result#* }

if [ -n "$authorize_url" ]; then
	# The mock IdP approves immediately and sends the browser to the app's callback.
	result=$(probe "$authorize_url")
	callback_url=${result#* }
	case "$callback_url" in
		"$ORIGIN"/login/callback\?*code=*) pass "mock IdP redirects to $ORIGIN/login/callback with a code" ;;
		*) fail "mock IdP expected to redirect to $ORIGIN/login/callback?code=..., got '$result'" ;;
	esac

	# The callback page auto-submits this form; it exchanges the code with the IdP
	# from inside the container and stores the session in Postgres.
	result=$(probe -b "$JAR" -c "$JAR" -X POST -H "Accept: text/html" -H "Origin: $ORIGIN" \
		--data-urlencode "url=$callback_url" "$APP_URL/login/callback?/login")
	# Cookie jar lines for HttpOnly cookies start with "#HttpOnly_", so only skip
	# real comment lines ("# ...") when listing names.
	cookie_names=$(awk '!/^# / && NF >= 6 {printf "%s ", $6}' "$JAR")
	case "$result $cookie_names" in
		"302 "*" session "*) pass "POST /login/callback -> 302 with a session cookie (token exchange + DB write succeeded)" ;;
		*) fail "POST /login/callback expected 302 and a session cookie, got '$result' (cookies: $cookie_names)" ;;
	esac

	# A logged-in user is sent from / to the dashboard, which reads from Mockoon.
	result=$(probe -b "$JAR" "$APP_URL/")
	case "$result" in
		"302 "*/dashboard) pass "GET / with session -> 302 to /dashboard (logged in)" ;;
		*) fail "GET / with session expected 302 to /dashboard, got '$result'" ;;
	esac

	result=$(probe -b "$JAR" "$APP_URL/dashboard")
	case "$result" in
		"200 "*) pass "GET /dashboard with session -> 200 (FHIR data reachable via mockoon)" ;;
		*) fail "GET /dashboard with session expected 200, got '$result'" ;;
	esac
fi

[ "$FAILED" -eq 0 ]
