import { env } from "$env/dynamic/private";
import { appendPathToUrl } from "$lib/utils";
import { decodeBase64url, encodeBase64url } from "@oslojs/encoding";
import { error } from "@sveltejs/kit";
import type { DocumentReference } from "fhir/r4";
import type { PageServerLoad } from "./$types";

export const load = (async ({ params, locals, fetch }) => {
	const documentId = new TextDecoder().decode(decodeBase64url(params.documentId));
	const accessToken = await locals.validAccessToken();
	const headers = {
		Authorization: "Bearer " + accessToken,
	};

	const documentURL = appendPathToUrl(new URL(env.FHIR_DOCUMENT_REFERENCE_URL), documentId);
	const response = await fetch(documentURL, {
		method: "GET",
		headers,
	});

	if (!response.ok) {
		error(response.status, response.statusText);
	}

	const document = (await response.json()) as DocumentReference;
	if (document.content[0].attachment.url) {
		const encoded = encodeBase64url(new TextEncoder().encode(document.content[0].attachment.url));
		document.content[0].attachment.url = `/documents/${encoded}`;
	}
	return { document };
}) satisfies PageServerLoad;
