import { env } from '$env/dynamic/private';
import { addPathToUrl } from '$lib/util';
import type { Resource, Task } from 'fhir/r4';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals, params }) => {
	const accessToken = await locals.validAccessToken();
	const headers = {
		Authorization: 'Bearer ' + accessToken,
		'Content-Type': 'application/json; charset=utf-8'
	};
	let url = addPathToUrl(env.FHIR_TASK_URL, params.id);
	url.searchParams.set('_format', 'json');

	return {
		task: fetch(url, { headers }).then(async (res) => {
			if (!res.ok) {
				throw new Error(`Failed to fetch task: ${res.status} ${res.statusText}`);
			}

			const task = (await res.json()) as Task;

			if (task.focus?.reference) {
				const resourceType = task.focus.reference.split('/')[0];
				const response = await fetch(addPathToUrl(env.FHIR_BASE_URL, task.focus.reference), {
					headers
				});
				if (!response.ok) {
					throw new Error(`Failed to fetch resource: ${response.status} ${response.statusText}`);
				}
				const resource = (await response.json()) as Resource;
				return { task, resourceType: resourceType, focus: resource };
			}
			return { task };
		})
	};
}) satisfies PageServerLoad;
