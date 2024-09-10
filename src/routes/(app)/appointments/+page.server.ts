import { env } from '$env/dynamic/private';
import { addQueryParamsToUrl } from '$lib/util';
import dayjs from 'dayjs';
import type { Appointment, Bundle } from 'fhir/r4';
import type { PageServerLoad } from './$types';

async function extractAppointments(response: Response): Promise<Appointment[]> {
	if (response.ok) {
		const bundle = (await response.json()) as Bundle;
		const entries =
			bundle.entry
				?.filter((entry) => entry.resource?.resourceType == 'Appointment')
				.map((entry) => entry.resource as Appointment)
				.sort((a, b) => (dayjs(a.start!).isAfter(b.start!) ? -1 : 1)) ?? [];
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
	let url = new URL(env.FHIR_APPOINTMENT_URL);
	if (env.FHIR_APPOINTMENT_DEFAULT_SEARCH_PARAMS) {
		url = addQueryParamsToUrl(env.FHIR_APPOINTMENT_URL, env.FHIR_APPOINTMENT_DEFAULT_SEARCH_PARAMS);
	}
	url.searchParams.set('_format', 'json');

	// NOTE: This does NOT use the SvelteKit fetch adapter, since the automatic
	// origin header can cause issues with some FHIR servers due to CORS policy
	// implementations.
	return { entries: fetch(url, { headers }).then((response) => extractAppointments(response)) };
}) satisfies PageServerLoad;
