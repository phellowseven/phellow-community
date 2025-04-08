import { route } from "$lib/ROUTES";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async () => {
	return redirect(302, route("/dashboard"));
}) satisfies PageServerLoad;
