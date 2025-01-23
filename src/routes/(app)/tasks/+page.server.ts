import { env } from "$env/dynamic/private";
import { extractTasks } from "$lib/task";
import { addQueryParamsToUrl } from "$lib/utils";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals }) => {
	const accessToken = await locals.validAccessToken();
	const headers = {
		Authorization: "Bearer " + accessToken,
		"Content-Type": "application/json; charset=utf-8",
	};
	let url = new URL(env.FHIR_TASK_URL);
	if (env.FHIR_TASK_DEFAULT_SEARCH_PARAMS) {
		url = addQueryParamsToUrl(env.FHIR_TASK_URL, env.FHIR_TASK_DEFAULT_SEARCH_PARAMS);
	}
	url.searchParams.set("_format", "json");

	return {
		tasks: fetch(url, { headers }).then((response) => extractTasks(response)),
	};
}) satisfies PageServerLoad;
