import { env } from "$env/dynamic/private";
import { json, text } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url, locals }) => {
	// You receive a request to resolve a FHIR reference to a resource.
	// The reference is in the URL query parameter `reference`.
	const reference = new URLSearchParams(url.searchParams).get("reference");
	if (!reference) {
		return text("Bad Request", { status: 400 });
	}
	// You must return a FHIR resource in the response body.
	// You can use the `fetch` function to make requests to other servers.
	const accessToken = await locals.validAccessToken();
	const headers = {
		Authorization: "Bearer " + accessToken,
		// 'Content-Type': 'application/json; charset=utf-8'
	};

	// NOTE: This does NOT use the SvelteKit fetch adapter, since the automatic
	// origin header can cause issues with some FHIR servers due to CORS policy
	// implementations.
	const response = await fetch(`${env.FHIR_BASE_URL}/${reference}`, { headers });
	if (!response.ok) {
		return text("Not Found", { status: 404 });
	}
	const resource = await response.json();
	return json(resource, { status: 200, headers: { "content-type": "application/json+fhir" } });
};
