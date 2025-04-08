import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load = (async ({ route }) => {
	// Check if the user has access to the module
	if (route.id) {
		return {};
	}
	return error(403, "You do not have access to this module");
}) satisfies LayoutServerLoad;
