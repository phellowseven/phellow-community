import questionnaire from '$lib/questionnaires/An02E.json';
import type { PageServerLoad } from './$types';

import type { Questionnaire } from 'fhir/r4';

export const load = (async () => {
	return { questionnaire: questionnaire as Questionnaire };
}) satisfies PageServerLoad;
