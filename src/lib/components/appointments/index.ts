import * as m from "$lib/paraglide/messages";
import dayjs from "dayjs";
import type { Appointment, AppointmentParticipant } from "fhir/r4";
import { groupBy, sortBy } from "lodash-es";

export function groupByMonth(documentReferences: Appointment[]): _.Dictionary<Appointment[]> {
	return groupBy(sortBy(documentReferences, (doc) => doc.start).reverse(), (doc: Appointment) => {
		const date = dayjs(doc.start);
		return date.format("YYYY-MM");
	});
}

export function statusColor(status: Appointment["status"]) {
	switch (status) {
		case "booked":
		case "fulfilled":
			return "bg-green-100 text-green-800";
		case "pending":
			return "bg-yellow-100 text-yellow-800";
		case "cancelled":
		case "noshow":
			return "bg-red-100 text-red-800";
		case "arrived":
			return "bg-green-200 text-green-800";
		case "proposed":
			return "bg-blue-100 text-blue-800";
		case "pending":
			return "bg-yellow-100 text-yellow-800";
		default:
			return "";
	}
}
export function participantStatusColor(status: AppointmentParticipant["status"]) {
	switch (status) {
		case "accepted":
			return "bg-green-100 text-green-800";
		case "declined":
			return "bg-red-100 text-red-800";
		case "tentative":
			return "bg-yellow-100 text-yellow-800";
		case "needs-action":
			return "bg-gray-100 text-gray-800";
		default:
			return "";
	}
}

export function statusText(status: Appointment["status"]) {
	switch (status) {
		case "booked":
			return m.appointment_status_booked();
		case "pending":
			return m.appointment_status_pending();
		case "cancelled":
			return m.appointment_status_cancelled();
		default:
			return status;
	}
}

export function participantStatusText(status: AppointmentParticipant["status"]) {
	switch (status) {
		case "accepted":
			return m.appointment_participant_status_accepted();
		case "declined":
			return m.appointment_participant_status_declined();
		case "tentative":
			return m.appointment_participant_status_tentative();
		case "needs-action":
			return m.appointment_participant_status_needs_action();
		default:
			return status;
	}
}
