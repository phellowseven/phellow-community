import { dev } from "$app/environment";
import {
	createSession,
	createUser,
	generateSessionToken,
	sessionEncryptionKeyName,
	setSessionTokenCookie,
} from "$lib/server/auth/auth";
import { config } from "$lib/server/auth/oauth";
import type { NewUser } from "$lib/server/db/schema";
import { encrypt, generateKey } from "$lib/server/encryption";
import { encodeBase64 } from "@oslojs/encoding";
import { redirect } from "@sveltejs/kit";
import * as client from "openid-client";
import type { Actions } from "./$types";

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const formData = await request.formData();
		const currentURL = formData.get("url") as string;

		try {
			const code_verifier = cookies.get("code_verifier");
			cookies.delete("code_verifier", { path: "/" });
			const nonce = cookies.get("nonce");
			cookies.delete("nonce", { path: "/" });

			let tokens = await client.authorizationCodeGrant(config, new URL(currentURL), {
				pkceCodeVerifier: code_verifier,
				expectedNonce: nonce,
				idTokenExpected: true,
			});

			let { access_token, refresh_token, id_token } = tokens;
			let idToken = tokens.claims();

			const symmetricEncryptionKey = await generateKey();

			// encrypt access token using symmetric key
			const encryptedAccessToken = await encrypt(
				symmetricEncryptionKey,
				new TextEncoder().encode(access_token)
			);
			const encryptedRefreshToken = await encrypt(
				symmetricEncryptionKey,
				new TextEncoder().encode(refresh_token)
			);
			const encryptedIdToken = await encrypt(
				symmetricEncryptionKey,
				new TextEncoder().encode(id_token)
			);

			// convert to base64
			const encryptedAccessTokenBase64 = encodeBase64(encryptedAccessToken);
			const encryptedRefreshTokenBase64 = encodeBase64(encryptedRefreshToken);
			const encryptedIdTokenBase64 = encodeBase64(encryptedIdToken);

			const user: NewUser = {
				email: idToken && (idToken["email"] as string),
				username: idToken && (idToken["preferred_username"] as string),
				name: idToken && (idToken["name"] as string),
				sub: idToken!.sub,
			};

			const dbUser = await createUser(user);
			if (dbUser) {
				const sessionToken = generateSessionToken();
				const session = await createSession(
					sessionToken,
					dbUser.id,
					encryptedAccessTokenBase64,
					encryptedRefreshTokenBase64,
					encryptedIdTokenBase64
				);

				setSessionTokenCookie(cookies, sessionToken, session.expiresAt);

				// store symmetric key in cookie
				const keyData = await crypto.subtle.exportKey("jwk", symmetricEncryptionKey);
				cookies.set(sessionEncryptionKeyName, JSON.stringify(keyData), {
					path: "/",
					secure: !dev,
					httpOnly: true,
					sameSite: "strict",
				});
			}
		} catch (error) {
			console.error(error);
		}

		redirect(302, "/");
	},
};
