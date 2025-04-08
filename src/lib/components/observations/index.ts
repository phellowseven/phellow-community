import type { Bundle, Observation } from "fhir/r4";

export async function extractObservations(response: Response): Promise<Observation[]> {
	if (response.ok) {
		const bundle = (await response.json()) as Bundle;
		const entries = bundle.entry
			?.filter((entry) => entry.resource?.resourceType == "Observation")
			.map((entry) => entry.resource as Observation);

		return entries ?? [];
	} else {
		console.error("Failed to fetch Observations:", response);
	}
	return [];
}
