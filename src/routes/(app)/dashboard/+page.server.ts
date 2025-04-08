import { env } from "$env/dynamic/private";
import { addQueryParamsToUrl } from "$lib/utils";
import type { Bundle } from "fhir/r4";
import type { PageServerLoad } from "../$types";

export const load = (async ({ locals }) => {
	const accessToken = await locals.validAccessToken();
	const headers = {
		Authorization: "Bearer " + accessToken,
		"Content-Type": "application/json; charset=utf-8",
	};

	// Observations
	let observationUrl = new URL(env.FHIR_OBSERVATION_URL!);
	if (env.FHIR_OBSERVATION_DEFAULT_SEARCH_PARAMS) {
		observationUrl = addQueryParamsToUrl(
			env.FHIR_OBSERVATION_URL!,
			env.FHIR_OBSERVATION_DEFAULT_SEARCH_PARAMS
		);
	}
	observationUrl.searchParams.set("_format", "json");

	let observationBundleResponse = fetch(observationUrl, { headers }).then(async (response) => {
		if (!response.ok) {
			return undefined;
		} else return ((await response.json()) as Bundle).total ?? undefined;
	});

	// Documents
	let documentUrl = new URL(env.FHIR_DOCUMENT_REFERENCE_URL!);
	if (env.FHIR_DOCUMENT_REFERENCE_DEFAULT_SEARCH_PARAMS) {
		documentUrl = addQueryParamsToUrl(
			env.FHIR_DOCUMENT_REFERENCE_URL!,
			env.FHIR_DOCUMENT_REFERENCE_DEFAULT_SEARCH_PARAMS
		);
	}
	documentUrl.searchParams.set("_format", "json");

	let documentReferenceBundleResponse = fetch(documentUrl, { headers }).then(async (response) => {
		if (!response.ok) {
			return undefined;
		} else return ((await response.json()) as Bundle).total ?? undefined;
	});

	// Appointments
	let appointmentUrl = new URL(env.FHIR_APPOINTMENT_URL!);
	if (env.FHIR_APPOINTMENT_DEFAULT_SEARCH_PARAMS) {
		appointmentUrl = addQueryParamsToUrl(
			env.FHIR_APPOINTMENT_URL!,
			env.FHIR_APPOINTMENT_DEFAULT_SEARCH_PARAMS
		);
	}
	appointmentUrl.searchParams.set("_format", "json");

	let appointmentBundleResponse = fetch(appointmentUrl, { headers }).then(async (response) => {
		if (!response.ok) {
			return undefined;
		} else return ((await response.json()) as Bundle).total ?? undefined;
	});

	// Tasks
	let taskUrl = new URL(env.FHIR_TASK_URL!);
	if (env.FHIR_TASK_DEFAULT_SEARCH_PARAMS) {
		taskUrl = addQueryParamsToUrl(env.FHIR_TASK_URL!, env.FHIR_TASK_DEFAULT_SEARCH_PARAMS);
	}
	taskUrl.searchParams.set("_format", "json");

	let taskBundleResponse = fetch(taskUrl, { headers }).then(async (response) => {
		if (!response.ok) {
			return undefined;
		} else return ((await response.json()) as Bundle).total ?? undefined;
	});

	return {
		observationBundleResponse,
		documentReferenceBundleResponse,
		appointmentBundleResponse,
		taskBundleResponse,
	};
}) satisfies PageServerLoad;
