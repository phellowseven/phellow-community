import { parseJWT } from "@oslojs/jwt";
import type { LayoutServerLoad } from "./$types";

export const load = (async ({ locals }) => {
	let scopes: string[] = [];

	const accessToken = await locals.validAccessToken();
	const [, payload] = parseJWT(accessToken);
	if ("scope" in payload) {
		scopes = (payload.scope as string).split(" ");
	}
	return {
		user: {
			name: locals.user?.name ?? null,
			email: locals.user?.email ?? null,
			username: locals.user?.username ?? null,
		},
		expiresAt: locals.session?.expiresAt,
		scopes,
	};
}) satisfies LayoutServerLoad;
