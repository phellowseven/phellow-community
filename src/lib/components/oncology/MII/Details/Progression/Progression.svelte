<script module lang="ts">
	const example: Observation = {
		resourceType: "Observation",
		id: "mii-exa-onko-verlauf-tumor",
		meta: {
			profile: [
				"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-verlauf",
			],
		},
		component: [
			{
				code: {
					coding: [
						{
							code: "277062004",
							system: "http://snomed.info/sct",
							display: "Status des Residualtumors",
						},
					],
				},
				valueCodeableConcept: {
					coding: [
						{
							code: "T",
							system:
								"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-verlauf-primaertumor",
							display: "Tumorreste (Residualtumor)",
						},
					],
				},
			},
			{
				code: {
					coding: [
						{
							code: "399656008",
							system: "http://snomed.info/sct",
							display: "Status of tumor metastasis to regional lymph nodes (observable entity)",
						},
					],
				},
				valueCodeableConcept: {
					coding: [
						{
							code: "P",
							system:
								"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-verlauf-lymphknoten",
							display: "bekannter Lymphknotenbefall Progress",
						},
					],
				},
			},
			{
				code: {
					coding: [
						{
							code: "399608002",
							system: "http://snomed.info/sct",
							display: "Status of distant metastasis (observable entity)",
						},
					],
				},
				valueCodeableConcept: {
					coding: [
						{
							code: "K",
							system:
								"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-verlauf-fernmetastasen",
							display: "keine Fernmetastasen nachweisbar",
						},
					],
				},
			},
		],
		status: "final",
		code: {
			coding: [
				{
					code: "396432002",
					system: "http://snomed.info/sct",
					display: "Status of regression of tumor (observable entity)",
				},
			],
		},
		subject: {
			reference: "Patient/example",
		},
		focus: [
			{
				reference: "Condition/exampleOncologicCondition",
			},
		],
		effectiveDateTime: "2024-02-08",
		valueCodeableConcept: {
			coding: [
				{
					code: "B",
					system:
						"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-verlauf-gesamtbeurteilung",
					display:
						"klinische Besserung des Zustandes, Teilremissionkriterien jedoch nicht erfüllt (minimal response, MR)",
				},
			],
		},
	};
</script>

<script lang="ts">
	import type { Observation } from "fhir/r4";

	import Assessment from "./Assessment.svelte";
	import { getStatusColor } from "./helper";
	import DetailedStatus from "./DetailedStatus.svelte";

	interface Props {
		class?: string;
		progression?: Observation;
	}

	let { class: classes, progression = example }: Props = $props();

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

	// Helper function to get overall assessment
	function getOverallAssessment() {
		const coding = progression.valueCodeableConcept?.coding?.[0];
		if (!coding) return undefined;

		return {
			display: coding.display || "Unbekannt",
			code: coding.code || "",
			date: formatDate(progression.effectiveDateTime),
		};
	}

	// Helper function to get component status
	function getComponentStatus(componentCode: string) {
		const component = progression.component?.find(
			(comp) => comp.code?.coding?.[0]?.code === componentCode
		);

		if (!component) return undefined;

		const coding = component.valueCodeableConcept?.coding?.[0];
		if (!coding) return undefined;

		return {
			display: coding.display || "Unbekannt",
			// code: coding.code || "",
			color: getStatusColor(coding.code || ""),
		};
	}

	// Get data for display
	const overallAssessment = getOverallAssessment();
	const primaryTumorStatus = getComponentStatus("277062004");
	const lymphNodeStatus = getComponentStatus("399656008");
	const metastasisStatus = getComponentStatus("399608002");
</script>

<h3 class="font-xl mt-0">Verlauf</h3>

<div class={["grid grid-cols-1 gap-8 md:grid-cols-2", classes]}>
	<!-- Overall Assessment Section -->
	<Assessment
		status={progression.status}
		date={overallAssessment?.date}
		code={overallAssessment?.code}
		display={overallAssessment?.display}
	/>

	<!-- Detailed Status Section -->
	<DetailedStatus {primaryTumorStatus} {lymphNodeStatus} {metastasisStatus} />
</div>
