import { logoutURL } from '$lib/server/auth/auth';
import { auth } from '$lib/server/auth/lucia';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, locals }) => {
	await auth.invalidateSession(locals.session!.id);

	const sessionCookie = auth.createBlankSessionCookie();
	cookies.set(sessionCookie.name, sessionCookie.value, {
		path: '/',
		...sessionCookie.attributes
	});

	redirect(307, logoutURL());

	// redirect(307, '/login');
};
