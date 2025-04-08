import { parseJWT } from "@oslojs/jwt";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals }) => {
	const accessToken = await locals.validAccessToken();
	const [, payload] = parseJWT(accessToken);
	if ("scope" in payload) {
		const scope = payload.scope as string;
		if (scope.includes("module_onco")) {
			return {};
		} else {
			return error(403, "You do not have access to this module");
		}
	}
	return {};
}) satisfies PageServerLoad;
