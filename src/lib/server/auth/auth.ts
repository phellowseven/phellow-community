import { env } from '$env/dynamic/private';
import { Issuer, type Client } from 'openid-client';

/**
 *
 * @returns the url that should get called by the IdP after logging out
 */
export function logoutURL(): URL {
	let url = new URL(env.OAUTH_CLIENT_ID!);
	url.searchParams.append('client_id', env.OAUTH_CLIENT_ID!);
	url.searchParams.append('post_logout_redirect_uri', env.OAUTH_LOGOUT_REDIRECT_URI!);

	return url;
}

let oauth2Client: Client;

async function connectOAuth2Client() {
	const issuer = await Issuer.discover(env.IDP_BASE_URL!);
	oauth2Client = new issuer.Client({
		client_id: env.OAUTH_CLIENT_ID!,
		client_secret: env.OAUTH_CLIENT_SECRET!,
		redirect_uris: redirectURIs(),
		response_types: ['code'],
		id_token_signed_response_alg: env.OAUTH_ID_TOKEN_SIGNED_RESPONSE_ALG!,
		token_endpoint_auth_method: 'none'
	});
}

function redirectURIs(): string[] {
	return env.OAUTH_CALLBACK?.split(',') ?? [];
}

function scopes(): string {
	return env.OAUTH_SCOPES ?? '';
}

export { connectOAuth2Client, oauth2Client, redirectURIs, scopes };
