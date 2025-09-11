import type { Bundle } from "fhir/r4";
import type { Event } from "./Timeline/timelineHelper";

/**
 * Parses a FHIR Bundle and extracts relevant oncology events into a standardized array.
 *
 * This function iterates through the entries of a FHIR Bundle, identifying resources of type
 * "Condition", "Procedure", and "Observation" that match specific oncology-related profiles.
 * For each recognized resource, it creates an `Event` object containing a title, start date,
 * type, and the original resource. Optionally, an end date is included for procedures.
 *
 * Supported event types:
 * - "diagnosis": Oncology diagnoses from "Condition" resources.
 * - "surgery": Surgical procedures from "Procedure" resources.
 * - "radiation": Radiation therapy procedures from "Procedure" resources.
 * - "systemicTherapy": Systemic therapy procedures from "Procedure" resources.
 * - "progression": Disease progression from "Observation" resources.
 *
 * @param bundle - The FHIR Bundle to parse.
 * @returns An array of `Event` objects sorted by their start date.
 */
export function parseFHIRBundle(bundle: Bundle): Event[] {
	const events: Event[] = [];

	if (!bundle.entry) return events;

	for (const entry of bundle.entry) {
		if (!entry.resource) continue;

		const resource = entry.resource;

		switch (resource.resourceType) {
			case "Condition":
				if (resource.meta?.profile?.some((p) => p.includes("mii-pr-onko-diagnose"))) {
					const startDate = resource.recordedDate ? new Date(resource.recordedDate) : undefined;
					if (!startDate) continue; // Skip if no start date

					events.push({
						startDate,
						type: "diagnosis",
						resourceId: resource.id!,
					});
				}
				break;

			case "Procedure":
				if (resource.meta?.profile?.some((p) => p.includes("mii-pr-onko-operation"))) {
					const startDate = resource.performedDateTime
						? new Date(resource.performedDateTime)
						: resource.performedPeriod?.start
							? new Date(resource.performedPeriod.start)
							: undefined;
					if (!startDate) continue; // Skip if no start date
					const endDate = resource.performedPeriod?.end
						? new Date(resource.performedPeriod.end)
						: undefined;

					events.push({
						startDate,
						endDate,
						type: "surgery",
						resourceId: resource.id!,
					});
				} else if (
					resource.meta?.profile?.some((p) => p.includes("mii-pr-onko-strahlentherapie"))
				) {
					const startDate = resource.performedDateTime
						? new Date(resource.performedDateTime)
						: resource.performedPeriod?.start
							? new Date(resource.performedPeriod.start)
							: undefined;
					if (!startDate) continue; // Skip if no start date
					const endDate = resource.performedPeriod?.end
						? new Date(resource.performedPeriod.end)
						: undefined;

					events.push({
						startDate,
						endDate,
						type: "radiation",
						resourceId: resource.id!,
					});
				} else if (
					resource.meta?.profile?.some((p) => p.includes("mii-pr-onko-systemische-therapie"))
				) {
					const startDate = resource.performedDateTime
						? new Date(resource.performedDateTime)
						: resource.performedPeriod?.start
							? new Date(resource.performedPeriod.start)
							: undefined;
					if (!startDate) continue; // Skip if no start date
					const endDate = resource.performedPeriod?.end
						? new Date(resource.performedPeriod.end)
						: undefined;

					events.push({
						startDate,
						endDate,
						type: "systemicTherapy",
						resourceId: resource.id!,
					});
				}
				break;

			case "Observation":
				if (resource.meta?.profile?.some((p) => p.includes("mii-pr-onko-verlauf"))) {
					const startDate = resource.effectiveDateTime
						? new Date(resource.effectiveDateTime)
						: undefined;
					if (!startDate) continue; // Skip if no start date

					events.push({
						startDate,
						type: "progression",
						resourceId: resource.id!,
					});
				} else if (
					resource.code.coding?.some((c) => c.system === "http://loinc.org" && c.code === "21908-9")
				) {
					// TNM classification
					const startDate = resource.effectiveDateTime
						? new Date(resource.effectiveDateTime)
						: undefined;
					if (!startDate) continue; // Skip if no start date

					events.push({
						startDate,
						type: "tnm",
						resourceId: resource.id!,
					});
				}
				/*
                else if (resource.meta?.profile?.some((p) => p.includes("mii-pr-onko-fernmetastasen"))) {
					const location = resource.valueCodeableConcept?.coding?.[0]?.code || "Metastase";
					const startDate = resource.effectiveDateTime
						? new Date(resource.effectiveDateTime)
						: undefined;
                    if (!startDate) continue; // Skip if no start date

					events.push({
						startDate,
						type: "progression",
						resource,
					});
				}
                    */
				break;
		}
	}

	return events.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}
