<script lang="ts">
	import type { Procedure } from "fhir/r4";

	import Residualstatus from "./Residualstatus.svelte";
	import SurgeryDetails from "./SurgeryDetails.svelte";
	import ComplicationsAndOutcome from "./ComplicationsAndOutcome.svelte";

	interface Props {
		class?: string;
	}

	let { class: classes }: Props = $props();

	const surgery: Procedure = {
		resourceType: "Procedure",
		id: "mii-exa-onko-operation-1",
		meta: {
			profile: [
				"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-operation",
			],
		},
		code: {
			coding: [
				{
					system: "http://fhir.de/CodeSystem/bfarm/ops",
					code: "5-870",
					display: "Partielle (brusterhaltende) Exzision der Mamma und Destruktion von Mammagewebe",
					version: "OPS 2021",
				},
			],
		},
		subject: {
			reference: "Patient/example",
		},
		encounter: {
			reference: "Encounter/example",
		},
		basedOn: [
			{
				reference: "CarePlan/example",
			},
		],
		status: "completed",
		extension: [
			{
				valueCodeableConcept: {
					coding: [
						{
							code: "K",
							system:
								"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-intention",
						},
					],
				},
				url: "https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-ex-onko-operation-intention",
			},
		],
		performedDateTime: "2021-12-04",
		complication: [
			{
				coding: [
					{
						code: "HNK",
						system:
							"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-operation-komplikation",
						display: "Hautnekrose im Operationsbereich",
					},
				],
			},
		],
		outcome: {
			coding: [
				{
					code: "R1",
					system:
						"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-residualstatus",
					display: "Mikroskopischer Residualtumor",
				},
			],
		},
	};

	// Helper function to format date
	function formatDate(dateString?: string) {
		if (!dateString) return "Unbekannt";
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("de-DE", {
			year: "numeric",
			month: "long",
			day: "numeric",
		}).format(date);
	}

	// Helper function to get surgery details
	function getSurgeryDetails() {
		const surgeryCode = surgery.code?.coding?.[0];
		return {
			name: surgeryCode?.display || "Operation",
			code: surgeryCode?.code || "",
			version: surgeryCode?.version || "",
			status: surgery.status === "completed" ? "Abgeschlossen" : surgery.status || "Unbekannt",
			date: formatDate(surgery.performedDateTime),
		};
	}

	// Helper function to get surgery intention
	function getSurgeryIntention() {
		const intentionExt = surgery.extension?.find(
			(ext) =>
				ext.url ===
				"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-ex-onko-operation-intention"
		);
		const intentionCode = intentionExt?.valueCodeableConcept?.coding?.[0]?.code;

		// Map intention codes to German descriptions
		const intentionMap: Record<string, string> = {
			K: "Kurativ - Heilung als Ziel",
			P: "Palliativ - Linderung von Beschwerden",
			D: "Diagnostisch",
			E: "Explorativ - Untersuchend",
			S: "Sonstiges",
		};

		return intentionCode ? intentionMap[intentionCode] || intentionCode : "Unbekannt";
	}

	// Helper function to get complications
	function getComplications() {
		if (!surgery.complication || surgery.complication.length === 0) {
			return ["Keine Komplikationen dokumentiert"];
		}

		return surgery.complication.map((complication) => {
			const coding = complication.coding?.[0];
			return coding?.display || coding?.code || "Unbekannte Komplikation";
		});
	}

	// Helper function to get outcome (residual status)
	function getOutcome() {
		const outcomeCoding = surgery.outcome?.coding?.[0];

		if (!outcomeCoding) return "Nicht dokumentiert";

		// If there's a display text, use it
		if (outcomeCoding.display) return outcomeCoding.display;

		// Otherwise map the code
		const outcomeMap: Record<string, string> = {
			R0: "Kein Residualtumor",
			R1: "Mikroskopischer Residualtumor",
			R2: "Makroskopischer Residualtumor",
			RX: "Vorhandensein von Residualtumor kann nicht beurteilt werden",
		};

		if (outcomeCoding.code) {
			return outcomeMap[outcomeCoding.code] || outcomeCoding.code;
		}
		return "Unbekannt";
	}

	// Get data for display
	const surgeryDetails = getSurgeryDetails();
	const surgeryIntention = getSurgeryIntention();
	const complications = getComplications();
	const outcome = getOutcome();
</script>

<h3 class="font-xl mt-0">Operation</h3>

<div class={["grid grid-cols-1 gap-8 md:grid-cols-2", classes]}>
	<!-- Surgery Details Section -->
	<SurgeryDetails
		name={surgeryDetails.name}
		code={surgeryDetails.code}
		version={surgeryDetails.version}
		status={surgeryDetails.status}
		date={surgeryDetails.date}
		{surgeryIntention}
	/>

	<!-- Complications and Outcome Section -->
	<ComplicationsAndOutcome {complications} {outcome} status={surgeryDetails.status} />

	<Residualstatus />
</div>
