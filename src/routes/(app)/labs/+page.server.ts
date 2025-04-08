// src/routes/structured/+page.server.ts
import { extractObservations } from "$components/observations";
import { env } from "$env/dynamic/private";
import { addQueryParamsToUrl } from "$lib/utils";
import dayjs from "dayjs";
import type { Observation } from "fhir/r4";
import { z } from "zod";
import type { PageServerLoad } from "./$types";

// Schema for validating URL parameters
const FilterParamsSchema = z.object({
	searchTerm: z.string(),
	category: z.string(),
	showOutOfRange: z.boolean(),
	sortBy: z.enum(["date", "name", "value", "range", "trend", "graph"]),
	sortOrder: z.enum(["asc", "desc"]),
});

type FilterParams = z.infer<typeof FilterParamsSchema>;

// Default filter state
const DEFAULT_FILTERS: FilterParams = {
	searchTerm: "",
	category: "all",
	showOutOfRange: false,
	sortBy: "date",
	sortOrder: "desc",
};

// Function to determine if a value is out of range
function isOutOfRange(observation: Observation): boolean {
	const value = observation.valueQuantity?.value;
	const low = observation.referenceRange?.[0]?.low?.value;
	const high = observation.referenceRange?.[0]?.high?.value;

	if (value === undefined || (low === undefined && high === undefined)) return false;
	return (low !== undefined && value < low) || (high !== undefined && value > high);
}

export const load = (async ({ locals, url }) => {
	// Parse URL parameters with safe defaults
	const rawParams = {
		searchTerm: url.searchParams.get("searchTerm") ?? DEFAULT_FILTERS.searchTerm,
		category: url.searchParams.get("category") ?? DEFAULT_FILTERS.category,
		showOutOfRange: url.searchParams.get("showOutOfRange") === "true",
		sortBy: url.searchParams.get("sortBy") ?? DEFAULT_FILTERS.sortBy,
		sortOrder: url.searchParams.get("sortOrder") ?? DEFAULT_FILTERS.sortOrder,
	};

	// Validate parameters
	const parsedParams = FilterParamsSchema.safeParse(rawParams);
	const filterParams = parsedParams.success ? parsedParams.data : DEFAULT_FILTERS;

	const accessToken = await locals.validAccessToken();
	const headers = {
		Authorization: "Bearer " + accessToken,
		"Content-Type": "application/json; charset=utf-8",
	};

	// Construct FHIR URL with search parameters
	let fhirUrl = new URL(env.FHIR_OBSERVATION_URL!);
	if (env.FHIR_OBSERVATION_DEFAULT_SEARCH_PARAMS) {
		fhirUrl = addQueryParamsToUrl(
			env.FHIR_OBSERVATION_URL!,
			env.FHIR_OBSERVATION_DEFAULT_SEARCH_PARAMS
		);
	}
	fhirUrl.searchParams.set("_format", "json");

	// Add category filter to FHIR query if specified
	// if (filterParams.category !== 'all') {
	// 	fhirUrl.searchParams.set('category', filterParams.category);
	// }

	// Fetch and filter observations
	let observations = await fetch(fhirUrl, { headers }).then((response) =>
		extractObservations(response)
	);

	// Apply category filter
	if (filterParams.category !== "all") {
		observations = observations.filter((obs) =>
			obs.category?.find((cat) => cat.coding?.[0]?.code === filterParams.category)
		);
	}

	// Apply text search filter
	if (filterParams.searchTerm) {
		observations = observations.filter((obs) => {
			const searchLower = filterParams.searchTerm.toLowerCase();
			return (
				obs.code?.text?.toLowerCase().includes(searchLower) ||
				obs.code?.coding?.[0]?.display?.toLowerCase().includes(searchLower)
			);
		});
	}

	// Apply out of range filter
	if (filterParams.showOutOfRange) {
		observations = observations.filter(isOutOfRange);
	}

	// Apply sorting
	observations.sort((a, b) => {
		const multiplier = filterParams.sortOrder === "asc" ? 1 : -1;
		switch (filterParams.sortBy) {
			case "date":
				return (
					multiplier *
					(dayjs(a.effectiveDateTime || "").isAfter(b.effectiveDateTime || "") ? 1 : -1)
				);
			case "name":
				return multiplier * (a.code?.text || "").localeCompare(b.code?.text || "");
			case "value":
				return multiplier * ((a.valueQuantity?.value || 0) - (b.valueQuantity?.value || 0));
			default:
				return 0;
		}
	});

	return {
		entries: observations,
		filterParams, // Return current filter state
	};
}) satisfies PageServerLoad;
