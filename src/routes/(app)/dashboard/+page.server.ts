import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	const accessToken = await locals.validAccessToken();
	return {};
}) satisfies PageServerLoad;
