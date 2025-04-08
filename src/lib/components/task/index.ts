import type { Task } from "fhir/r4";

import * as m from "$lib/paraglide/messages";

export function statusColor(status: Task["status"]) {
	switch (status) {
		case "requested":
		case "draft":
		case "in-progress":
		case "on-hold":
		case "ready":
			return "bg-blue-100 text-blue-800";
		case "completed":
		case "received":
		case "accepted":
			return "bg-green-100 text-green-800";
		case "cancelled":
		case "entered-in-error":
		case "rejected":
			return "bg-gray-100 text-gray-800";
		case "failed":
			return "bg-red-100 text-red-800";
		default:
			return "bg-gray-100 text-gray-800";
	}
}

export function statusText(status: Task["status"]) {
	switch (status) {
		case "requested":
			return m.task_status_requested();
		case "draft":
			return m.task_status_draft();
		case "in-progress":
			return m.task_status_in_progress();
		case "on-hold":
			return m.task_status_on_hold();
		case "ready":
			return m.task_status_ready();
		case "completed":
			return m.task_status_completed();
		case "received":
			return m.task_status_received();
		case "accepted":
			return m.task_status_accepted();
		case "cancelled":
			return m.task_status_cancelled();
		case "entered-in-error":
			return m.task_status_entered_in_error();
		case "rejected":
			return m.task_status_rejected();
		case "failed":
			return m.task_status_failed();
	}
}
