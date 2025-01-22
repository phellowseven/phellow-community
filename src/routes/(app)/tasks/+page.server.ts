import { env } from '$env/dynamic/private';
import { addQueryParamsToUrl } from '$lib/util';
import type { Bundle, Task } from 'fhir/r4';
import type { PageServerLoad } from './$types';

async function extractTasks(response: Response): Promise<Record<string, Task[]>> {
	if (response.ok) {
		const bundle = (await response.json()) as Bundle;
		const entries =
			bundle.entry
				?.filter((entry) => entry.resource?.resourceType == 'Task')
				.map((entry) => entry.resource as Task) ?? [];
		const groupedByCoding = entries.reduce((acc: Record<string, Task[]>, task) => {
			const coding = task.code?.coding?.[0];
			if (coding && coding.code) {
				acc[coding.display ?? coding.code] = acc[coding.display ?? coding.code] || [];
				acc[coding.display ?? coding.code].push(task);
			}
			return acc;
		}, {});
		return groupedByCoding;
	} else {
		console.error('Failed to fetch Tasks:', response);
	}
	return {};
}

export const load = (async ({ locals }) => {
	const accessToken = await locals.validAccessToken();
	const headers = {
		Authorization: 'Bearer ' + accessToken,
		'Content-Type': 'application/json; charset=utf-8'
	};
	let url = new URL(env.FHIR_TASK_URL);
	if (env.FHIR_TASK_DEFAULT_SEARCH_PARAMS) {
		url = addQueryParamsToUrl(env.FHIR_TASK_URL, env.FHIR_TASK_DEFAULT_SEARCH_PARAMS);
	}
	url.searchParams.set('_format', 'json');

	return {
		tasks: fetch(url, { headers }).then((response) => extractTasks(response))
	};
}) satisfies PageServerLoad;
