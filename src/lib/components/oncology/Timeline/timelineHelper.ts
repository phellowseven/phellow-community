import type { Icon as IconType } from "@lucide/svelte";
import { format } from "date-fns";

import Progression from "@lucide/svelte/icons/chart-gantt";
import Diagnosis from "@lucide/svelte/icons/file-search";
import Pill from "@lucide/svelte/icons/pill";
import Radiation from "@lucide/svelte/icons/radiation";
import RectangleEllipsis from "@lucide/svelte/icons/rectangle-ellipsis";
import Scissors from "@lucide/svelte/icons/scissors";

export type EventType =
	| "surgery"
	| "radiation"
	| "systemicTherapy"
	| "diagnosis"
	| "progression"
	| "tnm";

export interface Event {
	startDate: Date;
	endDate?: Date;
	type: EventType;
	lane?: number;
	resourceId: string;
}

// Get a color based on event type
export function getEventColor(type: EventType): string {
	const colors: Record<string, string> = {
		surgery: "bg-[#A48CA2]",
		radiation: "bg-[#D4B866]",
		progression: "bg-[#5A9E9F]",
		systemicTherapy: "bg-[#9CAF88]",
		diagnosis: "bg-[#708090]",
		tnm: "bg-[#B0C4DE]",
	};

	return colors[type] || "bg-gray-100";
}

export function getEventIcon(type: EventType): typeof IconType | null {
	switch (type) {
		case "surgery":
			return Scissors;
		case "radiation":
			return Radiation;
		case "systemicTherapy":
			return Pill;
		case "diagnosis":
			return Diagnosis;
		case "progression":
			return Progression;
		case "tnm":
			return RectangleEllipsis;
		default:
			return null;
	}
}

// Format date ranges
export function formatLegendDate(date: Date): string {
	return format(date, "MMM yyyy");
}
export function formatDateRange(start: Date, end: Date | null | undefined = undefined): string {
	if (!end || start.getTime() === end.getTime()) {
		return format(start, "dd. MMM yyyy");
	}

	return `${format(start, "dd. MMM yyyy")} - ${format(end, "dd. MMM yyyy")}`;
}

// Algorithm to compute lanes for events to avoid overlapping
export function computeLanes(events: Event[]): Event[][] {
	if (events.length === 0) return [];

	const lanes = [];
	const processedEvents: (Event & { lane: number | undefined; endTime: number })[] = events.map(
		(event) => ({
			...event,
			lane: undefined,
			endTime: event.endDate ? event.endDate.getTime() : event.startDate.getTime(),
		})
	);

	for (var event of processedEvents) {
		// Find the first lane where this event doesn't overlap
		let laneIndex = 0;
		let placed = false;

		while (!placed) {
			if (!lanes[laneIndex]) {
				// Create a new lane
				lanes[laneIndex] = [event];
				event.lane = laneIndex;
				placed = true;
			} else {
				// Check if event can be placed in this lane
				const canPlace = lanes[laneIndex].every((placedEvent) => {
					// Check if current event starts after placed event ends or ends before placed event starts
					return (
						event.startDate.getTime() > placedEvent.endTime ||
						event.endTime < placedEvent.startDate.getTime()
					);
				});

				if (canPlace) {
					lanes[laneIndex].push(event);
					event.lane = laneIndex;
					placed = true;
				} else {
					laneIndex++;
				}
			}
		}
	}

	return lanes;
}

export function getTitleForEvent(event: Event): string {
	switch (event.type) {
		case "diagnosis":
			return "Diagnose";
		case "surgery":
			return "Operation";
		case "radiation":
			return "Strahlentherapie";
		case "systemicTherapy":
			return "Systemische Therapie";
		case "progression":
			return "Verlauf";
		case "tnm":
			return "TNM-Klassifikation";
	}
}
