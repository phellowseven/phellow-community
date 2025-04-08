import type { Bundle, Task } from "fhir/r4";

export async function extractTasks(response: Response): Promise<Record<string, Task[]>> {
	if (response.ok) {
		const bundle = (await response.json()) as Bundle;
		const entries =
			bundle.entry
				?.filter((entry) => entry.resource?.resourceType == "Task")
				.map((entry) => entry.resource as Task) ?? [];
		const groupedByCoding = entries.reduce((acc: Record<string, Task[]>, task) => {
			const coding = task.code?.coding?.[0];
			if (coding && coding.code) {
				acc[coding.display ?? coding.code] = acc[coding.display ?? coding.code] || [];
				acc[coding.display ?? coding.code].push(task);
			}
			return acc;
		}, {});
		return groupedByCoding;
	} else {
		console.error("Failed to fetch Tasks:", response);
	}
	return {};
}
