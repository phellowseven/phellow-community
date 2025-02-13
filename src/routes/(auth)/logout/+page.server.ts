import { route } from "$lib/ROUTES";
import {
	deleteSessionEncryptionKeyCookie,
	deleteSessionTokenCookie,
	invalidateSession,
} from "$lib/server/auth/auth";
import { logoutURL } from "$lib/server/auth/oauth";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals, cookies }) => {
	if (locals.session) {
		await invalidateSession(locals.session.id);
		deleteSessionTokenCookie(cookies);
		deleteSessionEncryptionKeyCookie(cookies);
		const url = await logoutURL(locals.encryptionKey!, locals.session!.encryptedIdToken!);
		return redirect(302, url);
	}
	redirect(302, route("/login"));
}) satisfies PageServerLoad;
