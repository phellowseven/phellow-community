import { env } from '$env/dynamic/private';
import { addQueryParamsToUrl } from '$lib/util';
import type { Bundle, Observation } from 'fhir/r4';
import type { PageServerLoad } from './$types';

async function extractObservations(response: Response): Promise<Observation[]> {
	if (response.ok) {
		const bundle = (await response.json()) as Bundle;
		const entries = bundle.entry
			?.filter((entry) => entry.resource?.resourceType == 'Observation')
			.map((entry) => entry.resource as Observation);

		return entries ?? [];
	} else {
		console.error('Failed to fetch Observations:', response);
	}
	return [];
}

export const load = (async ({ locals }) => {
	const accessToken = await locals.validAccessToken();
	const headers = {
		Authorization: 'Bearer ' + accessToken,
		'Content-Type': 'application/json; charset=utf-8'
	};
	let url = new URL(env.FHIR_OBSERVATION_URL);
	if (env.FHIR_OBSERVATION_DEFAULT_SEARCH_PARAMS) {
		url = addQueryParamsToUrl(env.FHIR_OBSERVATION_URL, env.FHIR_OBSERVATION_DEFAULT_SEARCH_PARAMS);
	}
	url.searchParams.set('_format', 'json');

	return {
		entries: fetch(url, { headers }).then((response) => extractObservations(response))
	};
}) satisfies PageServerLoad;
