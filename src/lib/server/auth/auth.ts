import { env } from '$env/dynamic/private';
import { Issuer, type Client } from 'openid-client';

// IdP
const idp_base_url = env.IDP_BASE_URL;

// App
const client_id = env.OAUTH_CLIENT_ID;
const client_secret = env.OAUTH_CLIENT_SECRET;
const redirect_uris = env.OAUTH_CALLBACK.split(',');
const logout_uri = env.OAUTH_LOGOUT_URI;
const id_token_signed_response_alg = env.OAUTH_ID_TOKEN_SIGNED_RESPONSE_ALG;
const logout_redirect_url = env.OAUTH_LOGOUT_REDIRECT_URI;

/**
 *
 * @returns the url that should get called by the IdP after logging out
 */
export function logoutURL(): URL {
	let url = new URL(logout_uri);
	url.searchParams.append('client_id', client_id);
	url.searchParams.append('post_logout_redirect_uri', logout_redirect_url);

	return url;
}

let oauth2Client: Client;

async function connectOAuth2Client() {
	const issuer = await Issuer.discover(idp_base_url);
	oauth2Client = new issuer.Client({
		client_id,
		client_secret,
		redirect_uris,
		response_types: ['code'],
		id_token_signed_response_alg,
		token_endpoint_auth_method: 'none'
	});
}

export { connectOAuth2Client, oauth2Client, redirect_uris };
