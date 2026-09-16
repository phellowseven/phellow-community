import { env } from "$env/dynamic/private";
import { decodeBase64 } from "@oslojs/encoding";
import { JWTRegisteredClaims, parseJWT } from "@oslojs/jwt";
import * as client from "openid-client";
import { decrypt } from "../encryption";
import { logger } from "../logger";

const oauthLogger = logger.child({ module: "OAuth" });

export let config: client.Configuration;

function checkForEnvVariables() {
	const requiredEnvVars = [
		"OAUTH_CLIENT_ID",
		"OAUTH_CALLBACK",
		"IDP_BASE_URL",
		"OAUTH_LOGOUT_REDIRECT_URI",
	];
	for (const varName of requiredEnvVars) {
		if (!env[varName]) {
			throw new Error(`Missing required environment variable: ${varName}`);
		}
	}
}

checkForEnvVariables();

export async function connectOAuth2Client() {
	config = await client.discovery(
		new URL(env.IDP_BASE_URL!),
		env.OAUTH_CLIENT_ID!,
		env.OAUTH_CLIENT_SECRET,
		undefined,
		{
			execute: env.APP_ENV == "development" ? [client.allowInsecureRequests] : [],
		}
	);

	oauthLogger.trace(config.serverMetadata(), "Connected to OAuth2 server");
}

export function redirectURI(): string {
	return env.OAUTH_CALLBACK!;
}

export function scopes(): string {
	return env.OAUTH_SCOPES ?? "";
}

export function codeChallengeMethod(): string {
	return env.OAUTH_CODE_CHALLENGE_METHOD ?? "S256";
}

/**
 *
 * @returns the url to the endsession endpoint
 */
export async function logoutURL(encryptionKey: CryptoKey, encryptedIdToken: string): Promise<URL> {
	const decryptedIdToken = await decrypt(encryptionKey, decodeBase64(encryptedIdToken));
	const idToken = new TextDecoder().decode(decryptedIdToken);
	const url = client.buildEndSessionUrl(config, {
		post_logout_redirect_uri: env.OAUTH_LOGOUT_REDIRECT_URI!,
		id_token_hint: idToken,
	});
	return url;
}

export async function refreshAccessTokenIfNecessary(
	encryptionKey: CryptoKey,
	encryptedAccessToken: string,
	encryptedRefreshToken: string,
	encryptedIdToken: string
): Promise<{ accessToken: string; refreshToken: string; idToken: string; wasRefreshed: boolean }> {
	oauthLogger.trace("Refreshing access token if necessary");
	const decryptedAccessToken = await decrypt(encryptionKey, decodeBase64(encryptedAccessToken));
	const accessToken = new TextDecoder().decode(decryptedAccessToken);

	const decryptedIdToken = await decrypt(encryptionKey, decodeBase64(encryptedIdToken));
	const idToken = new TextDecoder().decode(decryptedIdToken);

	const decryptedRefreshToken = await decrypt(encryptionKey, decodeBase64(encryptedRefreshToken));
	const refreshToken = new TextDecoder().decode(decryptedRefreshToken);

	const [_, payload] = parseJWT(accessToken);
	const claims = new JWTRegisteredClaims(payload);
	if (claims.verifyExpiration()) {
		oauthLogger.trace("Access token is not expired");
		return {
			accessToken: accessToken,
			refreshToken: refreshToken,
			idToken: idToken,
			wasRefreshed: false,
		};
	} else {
		oauthLogger.trace("Access token is expired");
		// access token is expired, refresh it
		const tokenSet = await client.refreshTokenGrant(config, refreshToken);
		oauthLogger.trace("Refreshed token");
		const newAccessToken = tokenSet.access_token;
		const newRefreshToken = tokenSet.refresh_token || refreshToken;
		const newIdToken = tokenSet.id_token || idToken;

		return {
			accessToken: newAccessToken,
			refreshToken: newRefreshToken,
			idToken: newIdToken,
			wasRefreshed: true,
		};
	}
}
