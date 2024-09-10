import { env } from '$env/dynamic/private';
import { uploadDocumentSchema } from '$lib/document/form';
import { addQueryParamsToUrl } from '$lib/util';
import type { Bundle, DocumentReference } from 'fhir/r4';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';

async function extractDocumentReferences(response: Response): Promise<DocumentReference[]> {
	if (response.ok) {
		const bundle = (await response.json()) as Bundle;
		const entries =
			bundle.entry
				?.filter((entry) => entry.resource?.resourceType == 'DocumentReference')
				.map((entry) => entry.resource as DocumentReference)
				.map((entry) => {
					if (entry.content[0].attachment.url) {
						entry.content[0].attachment.url = `/documents/${Buffer.from(entry.content[0].attachment.url).toString('base64')}`;
					}
					return entry;
				}) ?? [];
		return entries;
	}
	return [];
}

export const load = (async ({ locals }) => {
	const accessToken = await locals.validAccessToken();
	const headers = {
		Authorization: 'Bearer ' + accessToken,
		'Content-Type': 'application/json; charset=utf-8'
	};
	let url = new URL(env.FHIR_DOCUMENT_REFERENCE_URL);
	if (env.FHIR_DOCUMENT_DEFAULT_SEARCH_PARAMS) {
		url = addQueryParamsToUrl(
			env.FHIR_DOCUMENT_REFERENCE_URL,
			env.FHIR_DOCUMENT_DEFAULT_SEARCH_PARAMS
		);
	}
	url.searchParams.set('_format', 'json');

	const uploadDocumentForm = await superValidate(zod(uploadDocumentSchema));

	// NOTE: This does NOT use the SvelteKit fetch adapter, since the automatic
	// origin header can cause issues with some FHIR servers due to CORS policy
	// implementations.
	return {
		entries: fetch(url, { headers }).then((response) => extractDocumentReferences(response)),
		uploadDocumentForm
	};
}) satisfies PageServerLoad;
