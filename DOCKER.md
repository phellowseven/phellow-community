# Docker Setup Guide

This project provides a streamlined Docker setup with separated concerns and multiple deployment
scenarios.

## 🏗️ Architecture

### Main Components

- **Main App**: Optimized multi-stage Dockerfile with development/production targets
- **Mock Services**: Separate containers for OIDC and API mocking
- **Database**: PostgreSQL with proper health checks

### File Structure

```txt
├── Dockerfile              # Main app (dev + prod targets)
├── docker/
│   └── oidc-mock.Dockerfile # OIDC authentication mock
├── docker-compose.yml      # Default (production-ready)
├── docker-compose.development.yml  # Full development stack
├── docker-compose.local.yml # Local development
└── docker-compose.test.yml  # Testing environment
```

## 🚀 Quick Start

### Default Production-Ready

```bash
# First, create your env file:
cp .env.production.example .env.production
# Edit .env.production with your real values, then:
docker-compose up
```

Starts production-ready app with database at <http://localhost:3000>

### Development with Mocks

```bash
# Create development env file:
cp .env.development.example .env.development
# Ready to use as-is, then:
docker-compose -f docker-compose.development.yml up
```

Full development stack with hot reloading at <http://localhost:5173>

The example file uses `localhost` URLs so it also works for running the app outside Docker. Inside
the `web` container those would point at the container itself, so `docker-compose.development.yml`
overrides the service URLs with the compose hostnames (`oidc-mock:8080`, `mockoon:3000`, `db:5432`).
You do not need to edit the env file for Docker.

To verify the stack from a clean checkout (this is what CI runs):

```bash
scripts/smoke-dev-stack.sh            # SMOKE_WEB_PORT=5174 if 5173 is busy
```

## 📋 Deployment Scenarios

### 1. Default Production-Ready (`docker-compose.yml`)

#### Optimized production setup with database

- ✅ Multi-stage optimized build
- ✅ Security hardening (read-only, non-root)
- ✅ Resource limits
- ✅ PostgreSQL database included
- ❌ No mock services (uses external APIs/OIDC)
- 🔗 App: <http://localhost:3000>

### 2. Development (`docker-compose.development.yml`)

#### Full stack with hot reloading and all mocks

- ✅ Hot reloading with volume mounts
- ✅ All mock services (OIDC, API, DB)
- ✅ Debug environment
- 🔗 App: <http://localhost:5173>
- 🔗 API Mock: <http://localhost:3000>
- 🔗 OIDC Mock: <http://localhost:8080>

### 3. Local (`docker-compose.local.yml`)

#### Infrastructure in containers, app runs locally

- ✅ Database and mocks in containers
- ❌ App runs with `pnpm dev` locally
- 🎯 Best for active development

### 4. Testing (`docker-compose.test.yml`)

#### Isolated testing environment

- ✅ Test database with test data
- ✅ Separate test configurations
- ✅ E2E test runner included

## 🔧 Environment Files

**⚠️ REQUIRED SETUP**: Before running any Docker commands, you must create environment files from
the provided templates:

```bash
# Copy template files and customize with your values
cp .env.production.example .env.production
cp .env.development.example .env.development
cp .env.test.example .env.test

# Load environment variables using tools of your choosing:
# - direnv: direnv allow (with .envrc file)
# - dotenv-cli: dotenv -e .env.development -- command
# - source: source .env.development
# - or use your preferred environment variable management tool
```

### Environment Files by Scenario

- **`.env.production`** - Production deployment (customize with real credentials)
- **`.env.development`** - Development with mocks (ready to use as-is)
- **`.env.test`** - Testing environment (ready to use as-is)
- **`.env.development.local`** - Local development (ready to use as-is)

### Security Notes

- ✅ Template files (`.env.*.example`) are tracked in git
- ❌ Actual env files (`.env.*`) are gitignored and contain sensitive data
- 🔒 Never commit files with real passwords or API keys
- 📝 Customize `.env.production` with your real production values

### Required Customization

For **production**, you MUST update these values in `.env.production`:

- `FHIR_BASE_URL` - Your FHIR server URL
- `IDP_BASE_URL` - Your OAuth/OIDC provider URL
- `OAUTH_CLIENT_ID` & `OAUTH_CLIENT_SECRET` - Your OAuth credentials
- `POSTGRES_PASSWORD` - Strong database password
- `ORIGIN` - Your domain URL

For **development/testing**, the template values work out-of-the-box with the included mock
services.

## 🗃️ Database Migrations

The Docker setup automatically handles Drizzle ORM database migrations:

### Migration Process

1. **Database starts** - PostgreSQL container becomes healthy
2. **Migration runs** - Dedicated migration container applies schema changes
3. **App starts** - Main application starts only after successful migration

### Migration Container Features

- ✅ Waits for database readiness with `pg_isready`
- ✅ Runs `pnpm run db:migrate` to apply Drizzle migrations
- ✅ Uses the same app image for consistency
- ✅ Fails fast if migrations fail (prevents app startup)
- ✅ One-time execution (restart: "no")

### Manual Migration Commands

If you need to run migrations manually:

```bash
# Production
docker-compose run --rm migrate

# Development
docker-compose -f docker-compose.development.yml run --rm migrate

# Testing
docker-compose -f docker-compose.test.yml run --rm migrate-test
```

### Migration Development Workflow

When you modify your Drizzle schema:

```bash
# 1. Generate new migration
pnpm run db:generate

# 2. Restart containers to apply migration
docker-compose down && docker-compose up

# Or just run migration manually
docker-compose run --rm migrate
```

### Troubleshooting

- **Migration fails**: Check logs with `docker-compose logs migrate`
- **Schema changes**: Ensure you've run `pnpm run db:generate` locally first
- **Permission issues**: Migration script is mounted read-only for security

## 🩺 Troubleshooting the Development Stack

- **Every page answers HTTP 500**: the app resolves its OIDC provider once at startup. Check
  `docker-compose -f docker-compose.development.yml logs web` for `ECONNREFUSED` (the app cannot
  reach `oidc-mock`) or `... is not a function` from `$lib/paraglide/messages` (the translation
  catalog was compiled without the `messages/` folder). Both indicate a broken setup, not a broken
  identity provider; `docker-compose ... down -v` and `up --build` again.
- **<http://localhost:8080> shows "404 Not Found"**: that is expected. The OIDC mock has no page at
  its root. The real endpoint is <http://localhost:8080/.well-known/openid-configuration>, which
  must answer 200. The `oidc-mock` container's health check probes exactly that URL.
- **`web` never starts**: it waits for `db`, `mockoon` and `oidc-mock` to be healthy and for
  `migrate` to finish. `docker-compose ... ps` shows which one is stuck.
- **Port already in use**: the dev stack binds host ports 5173, 3000, 8080 and 5432. Stop the
  conflicting process, or for the smoke test set `SMOKE_WEB_PORT`. Port 8080 cannot be remapped
  because the browser is redirected to `localhost:8080` for login.

## 🛠️ Build Targets

The main Dockerfile supports multiple targets:

```bash
# Development with hot reloading
docker build --target development -t app:dev .

# Production optimized
docker build --target production -t app:prod .
```

## 📊 Health Checks

All services include proper health checks:

- **Database**: `pg_isready`
- **Mockoon**: HTTP health endpoint
- **OIDC Mock**: OpenID configuration endpoint
- **App**: Custom health endpoint

## 🔒 Security Features (Production)

- Non-root user execution
- Read-only filesystem
- No new privileges
- Resource limits
- Minimal attack surface

## 🎯 Usage Examples

```bash
# Start production-ready (default)
docker-compose up

# Start development with mocks
docker-compose -f docker-compose.development.yml up

# Start with specific environment file
docker-compose --env-file .env.dev up

# Run tests
docker-compose -f docker-compose.test.yml up --abort-on-container-exit

# Clean up
docker-compose down -v  # Remove volumes too
```
