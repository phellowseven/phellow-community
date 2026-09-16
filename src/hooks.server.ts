import { building, dev } from "$app/environment";
import { paraglideMiddleware } from "$lib/paraglide/server";
import { route } from "$lib/ROUTES";
import {
	sessionCookieName,
	sessionEncryptionKeyName,
	validateSessionToken,
} from "$lib/server/auth/auth";
import { connectOAuth2Client, refreshAccessTokenIfNecessary } from "$lib/server/auth/oauth";
import type { Session } from "$lib/server/db/schema";
import { encrypt, parseCryptoKeyFromJsonWebKeyString } from "$lib/server/encryption";
import { logger } from "$lib/server/logger";
import { SessionService } from "$lib/server/services/session_service";
import { encodeBase64 } from "@oslojs/encoding";
import { redirect, type Handle, type ServerInit } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

const hooksLogger = logger.child({ module: "ServerHooks" });

const paraglideHandle: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request: localizedRequest, locale }) => {
		event.request = localizedRequest;
		return resolve(event, {
			transformPageChunk: ({ html }) => {
				return html.replace("%lang%", locale);
			},
		});
	});

// This is called once when the server starts
export const init: ServerInit = async () => {
	// Skip OAuth2 initialization during build/prerender to avoid connection errors
	if (building) {
		hooksLogger.info("Skipping OAuth2 initialization during build process");
		return;
	}

	await connectOAuth2Client();
};

const authHandle: Handle = async ({ event, resolve }) => {
	if (dev) {
		hooksLogger.trace({ route: event.route.id }, "handling auth");
	}
	const sessionId = event.cookies.get(sessionCookieName);

	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
	}

	const authRequired =
		(event.route.id?.indexOf("(app)") ?? -1) != -1 ||
		(event.route.id?.indexOf("(api)") ?? -1) != -1 ||
		(event.route.id?.indexOf("(auth)/logout") ?? -1) != -1;

	if (authRequired) {
		if (!sessionId) {
			hooksLogger.trace("No session id found from cookies");
			return redirect(307, route("/login"));
		}

		const { session, user } = await validateSessionToken(sessionId);

		if (!session) {
			hooksLogger.trace("No session found returned from validateSessionToken");
			event.cookies.delete(sessionCookieName, {
				path: "/",
			});
			return redirect(307, route("/login"));
		}

		event.locals.user = user;
		event.locals.session = session;

		const symmetricEncryptionKey = event.cookies.get(sessionEncryptionKeyName)!;
		event.locals.encryptionKey = await parseCryptoKeyFromJsonWebKeyString(symmetricEncryptionKey);
		event.locals.validAccessToken = async () => {
			hooksLogger.trace("Checking if access token is valid");
			const { accessToken, refreshToken, idToken, wasRefreshed } =
				await refreshAccessTokenIfNecessary(
					event.locals.encryptionKey!,
					event.locals.session!.encryptedAccessToken!,
					event.locals.session!.encryptedRefreshToken!,
					event.locals.session!.encryptedIdToken!
				);

			if (wasRefreshed) {
				// encrypt access token using symmetric key
				const newEncryptedAccessToken = await encrypt(
					event.locals.encryptionKey!,
					new TextEncoder().encode(accessToken)
				);

				const newEncryptedRefreshToken = await encrypt(
					event.locals.encryptionKey!,
					new TextEncoder().encode(refreshToken)
				);

				const newEncryptedIdToken = await encrypt(
					event.locals.encryptionKey!,
					new TextEncoder().encode(idToken)
				);

				// convert to base64
				const newEncryptedAccessTokenBase64 = encodeBase64(newEncryptedAccessToken);
				const newEncryptedRefreshTokenBase64 = encodeBase64(newEncryptedRefreshToken);
				const newEncryptedIdTokenBase64 = encodeBase64(newEncryptedIdToken);

				const updatedSession: Session = Object.assign({}, event.locals.session!, {
					encryptedAccessToken: newEncryptedAccessTokenBase64,
					encryptedRefreshToken: newEncryptedRefreshTokenBase64,
					encryptedIdToken: newEncryptedIdTokenBase64,
				});

				await SessionService.updateSession(updatedSession);
			}

			return accessToken;
		};
	}

	return resolve(event);
};

export const handle = sequence(authHandle, paraglideHandle);
