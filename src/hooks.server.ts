import { encrypt, parseCryptoKeyFromJsonWebKeyString } from '$lib/encryption';
import { i18n } from '$lib/i18n.js';
import { connectOAuth2Client } from '$lib/server/auth/auth';
import { auth } from '$lib/server/auth/lucia';
import { connectDB } from '$lib/server/db/db';
import { refreshAccessTokenIfNecessary } from '$lib/server_utils';
import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

const i18nHandler = i18n.handle();

await connectDB(); // async call so prerendering during `pnpm run build` works without trying to connect to DB.
await connectOAuth2Client(); // async call so prerendering during `pnpm run build` works without trying to connect to OAuth discovery endpoint.

const authHandle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname === '/') redirect(307, '/dashboard');

	const sessionId = event.cookies.get(auth.sessionCookieName);

	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
	}

	if (event.route.id?.indexOf('(app)') != -1 || event.route.id?.indexOf('(api)') != -1) {
		if (!sessionId) throw redirect(307, '/login');

		const { session, user } = await auth.validateSession(sessionId);

		if (session && session.fresh) {
			const sessionCookie = auth.createSessionCookie(session.id);
			// sveltekit types deviates from the de-facto standard
			// you can use 'as any' too
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '/',
				...sessionCookie.attributes
			});
		}
		if (!session) {
			const sessionCookie = auth.createBlankSessionCookie();
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '/',
				...sessionCookie.attributes
			});
		}

		event.locals.user = user;
		event.locals.session = session;

		const symmetricEncryptionKey = event.cookies.get('enc_key')!;
		event.locals.encryptionKey = await parseCryptoKeyFromJsonWebKeyString(symmetricEncryptionKey);
		event.locals.validAccessToken = async () => {
			const { accessToken, refreshToken, wasRefreshed } = await refreshAccessTokenIfNecessary(
				event.locals.encryptionKey!,
				event.locals.session!.encryptedAccessToken!,
				event.locals.session!.encryptedRefreshToken!
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

				// convert to base64
				const newEncryptedAccessTokenBase64 =
					Buffer.from(newEncryptedAccessToken).toString('base64');
				const newEncryptedRefreshTokenBase64 =
					Buffer.from(newEncryptedRefreshToken).toString('base64');

				const updatedSession = Object.assign({}, event.locals.session!, {
					encryptedAccessToken: newEncryptedAccessTokenBase64,
					encryptedRefreshToken: newEncryptedRefreshTokenBase64
				});

				await auth.invalidateSession(updatedSession.id);
				await auth.createSession(updatedSession.userId, updatedSession, {
					sessionId: updatedSession.id
				});
				event.locals.session = updatedSession;
			}

			return accessToken;
		};
	}

	return resolve(event);
};

export const handle = sequence(i18nHandler, authHandle);
