import { oauth2Client, scopes } from '$lib/server/auth/auth';
import { auth } from '$lib/server/auth/lucia';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, url }) => {
	const sessionId = cookies.get(auth.sessionCookieName);
	if (sessionId) {
		const { session } = await auth.validateSession(sessionId);
		if (session) redirect(307, '/');
	}

	if (url.searchParams.has('autologin')) {
		const authURL = oauth2Client.authorizationUrl({
			scope: scopes()
		});

		redirect(307, authURL);
	}

	return {
		autologin: url.searchParams.get('autologin')
	};
};

export const actions: Actions = {
	login: async ({}) => {
		const url = oauth2Client.authorizationUrl({
			scope: scopes()
		});

		redirect(307, url);
	}
};
