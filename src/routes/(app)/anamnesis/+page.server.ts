import { env } from '$env/dynamic/private';
import { addPathToUrl, addQueryParamsToUrl } from '$lib/util';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

import type { Questionnaire } from 'fhir/r4';

async function processQuestionnaire(response: Response): Promise<Questionnaire> {
	if (response.ok) {
		const json = await response.json();
		return json as Questionnaire;
	} else {
		return error(500, 'Failed to load questionnaire');
	}
}

export const load = (async ({ locals }) => {
	const accessToken = await locals.validAccessToken();
	const headers = {
		Authorization: 'Bearer ' + accessToken,
		'Content-Type': 'application/json; charset=utf-8'
	};
	let url = addPathToUrl(env.FHIR_QUESTIONNAIRE_URL, 'an02e');
	if (env.FHIR_QUESTIONNAIRE_DEFAULT_SEARCH_PARAMS) {
		url = addQueryParamsToUrl(
			env.FHIR_QUESTIONNAIRE_URL,
			env.FHIR_QUESTIONNAIRE_DEFAULT_SEARCH_PARAMS
		);
		url = addPathToUrl(url.toString(), 'an02e');
	}
	url.searchParams.set('_format', 'json');

	return {
		questionnaire: fetch(url, { headers }).then((response) => processQuestionnaire(response))
	};
}) satisfies PageServerLoad;
