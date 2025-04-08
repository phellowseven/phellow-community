import { env } from "$env/dynamic/private";
import { appendPathToUrl } from "$lib/utils";
import { decodeBase64url } from "@oslojs/encoding";
import { error } from "@sveltejs/kit";
import type { Appointment } from "fhir/r4";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals, params }) => {
	const appointmentId = new TextDecoder().decode(decodeBase64url(params.appointmentId));
	const accessToken = await locals.validAccessToken();
	const headers = {
		Authorization: "Bearer " + accessToken,
	};

	const appointmentURL = appendPathToUrl(new URL(env.FHIR_APPOINTMENT_URL), appointmentId);
	const response = await fetch(appointmentURL, {
		method: "GET",
		headers,
	});

	if (!response.ok) {
		error(response.status, response.statusText);
	}

	const appointment = (await response.json()) as Appointment;
	return { appointment };
}) satisfies PageServerLoad;
