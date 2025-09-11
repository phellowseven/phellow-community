import { env } from "$env/dynamic/private";
import { extractDocumentReferences } from "$lib/fhir/document";
import { uploadDocumentSchema } from "$lib/fhir/document/form";
import { addQueryParamsToUrl } from "$lib/utils";
import type { Bundle } from "fhir/r4";
import { fail, message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { Actions, PageServerLoad } from "./$types";

export const load = (async ({ locals }) => {
	let url = new URL(env.FHIR_DOCUMENT_REFERENCE_URL ?? `${env.FHIR_BASE_URL}/DocumentReference`);
	if (env.FHIR_DOCUMENT_DEFAULT_SEARCH_PARAMS) {
		url = addQueryParamsToUrl(url.href, env.FHIR_DOCUMENT_DEFAULT_SEARCH_PARAMS);
	}
	url.searchParams.set("_format", "json");

	const uploadDocumentForm = await superValidate(zod(uploadDocumentSchema));

	const accessToken = await locals.validAccessToken();
	const headers = {
		Authorization: "Bearer " + accessToken,
		"Content-Type": "application/json; charset=utf-8",
	};
	const asyncEntries = fetch(url, { headers }).then(async (response) =>
		extractDocumentReferences((await response.json()) as Bundle)
	);

	// NOTE: This does NOT use the SvelteKit fetch adapter, since the automatic
	// origin header can cause issues with some FHIR servers due to CORS policy
	// implementations.
	return {
		entries: asyncEntries,
		uploadDocumentForm,
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	uploadDocument: async ({ request }) => {
		const form = await superValidate(request, zod(uploadDocumentSchema));
		if (!form.valid) {
			return fail(400, { form });
		}
		return message(form, "Document uploaded successfully.");
	},
};
