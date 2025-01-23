import { route } from "$lib/ROUTES";
import {
	deleteSessionEncryptionKeyCookie,
	deleteSessionTokenCookie,
	invalidateUserSession,
} from "$lib/server/auth/auth";
import { logoutURL } from "$lib/server/auth/oauth";
import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
	logoutEverywhere: async ({ locals, cookies }) => {
		if (locals.session) {
			await invalidateUserSession(locals.session.userId);
			deleteSessionTokenCookie(cookies);
			deleteSessionEncryptionKeyCookie(cookies);
			const url = await logoutURL(locals.encryptionKey!, locals.session!.encryptedIdToken!);
			return redirect(302, url);
		}
		redirect(302, route("/login"));
	},
};
