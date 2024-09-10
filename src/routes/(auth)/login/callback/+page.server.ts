import { encrypt, generateKey } from '$lib/encryption';
import { oauth2Client, redirect_uris } from '$lib/server/auth/auth';
import { auth } from '$lib/server/auth/lucia';
import { createUser } from '$lib/server/auth/user';
import type { User } from '$lib/types/user';
import { redirect } from '@sveltejs/kit';
import crypto from 'crypto';
import type { Actions } from './$types';

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const formData = await request.formData();
		try {
			const params = oauth2Client.callbackParams(formData.get('url')!.toString());
			const tokenSet = await oauth2Client.callback(redirect_uris[0], params); // , { code_verifier }
			const idToken = tokenSet.claims();

			const symmetricEncryptionKey = await generateKey();

			// encrypt access token using symmetric key
			const encryptedAccessToken = await encrypt(
				symmetricEncryptionKey,
				new TextEncoder().encode(tokenSet.access_token)
			);
			const encryptedRefreshToken = await encrypt(
				symmetricEncryptionKey,
				new TextEncoder().encode(tokenSet.refresh_token)
			);

			// convert to base64
			const encryptedAccessTokenBase64 = Buffer.from(encryptedAccessToken).toString('base64');
			const encryptedRefreshTokenBase64 = Buffer.from(encryptedRefreshToken).toString('base64');

			const user: Omit<User, 'id'> = {
				email: idToken.email,
				username: idToken.preferred_username,
				sub: idToken.sub
			};

			const dbUser = await createUser(user);
			if (dbUser) {
				const session = await auth.createSession(dbUser.id, {
					email: idToken.email,
					username: idToken.preferred_username,
					encryptedAccessToken: encryptedAccessTokenBase64,
					encryptedRefreshToken: encryptedRefreshTokenBase64
				});
				const luciaCookie = auth.createSessionCookie(session.id);
				cookies.set(luciaCookie.name, luciaCookie.value, {
					path: '/',
					...luciaCookie.attributes
				});

				// store symmetric key in cookie
				const keyData = await crypto.subtle.exportKey('jwk', symmetricEncryptionKey);
				cookies.set('enc_key', JSON.stringify(keyData), {
					path: '/',
					secure: true,
					httpOnly: true,
					sameSite: 'strict'
				});
			}
		} catch (e) {
			// if (e instanceof OAuth2RequestError) {
			//     // see https://www.rfc-editor.org/rfc/rfc6749#section-5.2
			//     const { request, message, description } = e;
			// }
			// unknown error
			console.error(e);
		}

		redirect(302, '/dashboard');
	}
};
