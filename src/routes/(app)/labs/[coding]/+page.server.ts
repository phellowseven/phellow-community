// src/routes/structured/[coding]/+page.server.ts
import { env } from "$env/dynamic/private";
import { addQueryParamsToUrl } from "$lib/utils";
import { decodeBase64url } from "@oslojs/encoding";
import dayjs from "dayjs";
import type { Bundle, Observation } from "fhir/r4";
import type { PageServerLoad } from "./$types";

async function extractObservations(response: Response): Promise<Observation[]> {
	if (response.ok) {
		const bundle = (await response.json()) as Bundle;
		const entries = bundle.entry
			?.filter((entry) => entry.resource?.resourceType == "Observation")
			.map((entry) => entry.resource as Observation);

		return entries ?? [];
	} else {
		console.error("Failed to fetch Observations:", response);
	}
	return [];
}

export const load = (async ({ locals, params }) => {
	const accessToken = await locals.validAccessToken();
	const headers = {
		Authorization: "Bearer " + accessToken,
		"Content-Type": "application/json; charset=utf-8",
	};

	// Construct FHIR URL with search parameters
	let fhirUrl = new URL(env.FHIR_OBSERVATION_URL!);
	if (env.FHIR_OBSERVATION_DEFAULT_SEARCH_PARAMS) {
		fhirUrl = addQueryParamsToUrl(
			env.FHIR_OBSERVATION_URL!,
			env.FHIR_OBSERVATION_DEFAULT_SEARCH_PARAMS
		);
	}
	fhirUrl.searchParams.set("_format", "json");

	const codingString = new TextDecoder().decode(decodeBase64url(params.coding));

	// Add code filter to FHIR query
	// fhirUrl.searchParams.set('code', params.coding);
	// Ignored for development purposes

	// Fetch and filter observations
	let observations = await fetch(fhirUrl, { headers }).then((response) =>
		extractObservations(response)
	);

	// Filter observations by code after fetching all because mock server does not support code filtering
	// Add code filter to FHIR query as seen above to filter on the server
	const matches = observations.filter((observation) =>
		observation.code?.coding?.some((coding) => coding.code === codingString)
	);

	return {
		title: params.coding,
		observations: matches.sort((a, b) =>
			dayjs(a.effectiveDateTime || "").isAfter(b.effectiveDateTime || "") ? -1 : 1
		),
	};
}) satisfies PageServerLoad;
