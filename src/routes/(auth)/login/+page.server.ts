import { sessionCookieName, validateSessionToken } from "$lib/server/auth/auth";
import { codeChallengeMethod, config, redirectURI, scopes } from "$lib/server/auth/oauth";
import { redirect } from "@sveltejs/kit";
import * as client from "openid-client";
import type { Actions, PageServerLoad } from "./$types";

export const load = (async ({ cookies }) => {
	const sessionId = cookies.get(sessionCookieName);
	if (sessionId) {
		const { session } = await validateSessionToken(sessionId);
		if (session) redirect(307, "/");
	}

	return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
	login: async ({ cookies }) => {
		let code_verifier = client.randomPKCECodeVerifier();
		let code_challenge = await client.calculatePKCECodeChallenge(code_verifier);
		let nonce!: string;

		// redirect user to as.authorization_endpoint
		let parameters: Record<string, string> = {
			redirect_uri: redirectURI(),
			scope: scopes(),
			code_challenge,
			code_challenge_method: codeChallengeMethod(),
		};

		const supportsPKCE = config.serverMetadata().supportsPKCE(codeChallengeMethod());
		if (!supportsPKCE) {
			nonce = client.randomNonce();
			parameters.nonce = nonce;
			cookies.set("nonce", nonce, { path: "/", httpOnly: true });
		}

		cookies.set("code_verifier", code_verifier, { path: "/", httpOnly: true });

		let redirectTo = client.buildAuthorizationUrl(config, parameters);

		redirect(307, redirectTo.toString());
	},
};
