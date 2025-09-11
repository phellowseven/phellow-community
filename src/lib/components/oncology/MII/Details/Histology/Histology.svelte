<script module lang="ts">
	const exampleSpecimen: SpecimenType = {
		resourceType: "Specimen",
		id: "mii-exa-onko-specimen-1",
		meta: {
			profile: [
				"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-specimen",
			],
		},
		status: "available",
		subject: {
			reference: "Patient/example",
		},
		collection: {
			collectedDateTime: "2021-03-14",
		},
		identifier: [
			{
				value: "357532265",
			},
		],
	};

	const exampleBefund: DiagnosticReport = {
		resourceType: "DiagnosticReport",
		id: "mii-exa-onko-befund-1",
		meta: {
			profile: [
				"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-befund",
			],
		},
		code: {
			coding: [
				{
					code: "60568-3",
					system: "http://loinc.org",
				},
			],
		},
		status: "final",
		subject: {
			reference: "Patient/example",
		},
		basedOn: [
			{
				reference: "CarePlan/example-tumorboard-1",
			},
		],
		specimen: [
			{
				reference: "Specimen/example-specimen-2",
			},
		],
		conclusion:
			"Mäßig differenziertes invasiv duktales Karzinom (8500/3), Grading G2 an der rechten Mamma, ... ",
	};

	const exampleGrading: Observation = {
		resourceType: "Observation",
		id: "mii-exa-onko-grading-1",
		meta: {
			profile: [
				"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-grading",
			],
		},
		category: [
			{
				coding: [
					{
						code: "laboratory",
						system: "http://terminology.hl7.org/CodeSystem/observation-category",
					},
				],
			},
		],
		code: {
			coding: [
				{
					code: "33732-9",
					system: "http://loinc.org",
					display: "Histology grade [Identifier] in Cancer specimen",
				},
			],
		},
		status: "final",
		effectiveDateTime: "2022-04-21",
		valueCodeableConcept: {
			coding: [
				{
					system:
						"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-grading",
					code: "3",
				},
			],
		},
		subject: {
			reference: "Patient/example",
		},
		specimen: {
			reference: "Specimen/example",
		},
	};

	const exampleCheckedLymphnodes: Observation = {
		resourceType: "Observation",
		id: "mii-exa-onko-anzahl-untersuchte-lymphknoten-23",
		meta: {
			profile: [
				"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-anzahl-untersuchte-lymphknoten",
			],
		},
		category: [
			{
				coding: [
					{
						code: "laboratory",
						system: "http://terminology.hl7.org/CodeSystem/observation-category",
					},
				],
			},
		],
		code: {
			coding: [
				{
					code: "21894-1",
					system: "http://loinc.org",
					display: "Regional lymph nodes examined [#] Specimen",
				},
			],
		},
		valueQuantity: {
			system: "http://unitsofmeasure.org",
			code: "1",
			value: 23,
			unit: "#",
		},
		status: "final",
		subject: {
			reference: "Patient/example",
		},
		effectiveDateTime: "2024-01-11",
	};

	const exampleCheckedSentinelLymphnodes: Observation = {
		resourceType: "Observation",
		id: "mii-exa-onko-anzahl-untersuchte-sentinel-lymphknoten-0",
		meta: {
			profile: [
				"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-anzahl-untersuchte-sentinel-lymphknoten",
			],
		},
		category: [
			{
				coding: [
					{
						code: "laboratory",
						system: "http://terminology.hl7.org/CodeSystem/observation-category",
					},
				],
			},
		],
		code: {
			coding: [
				{
					code: "85347-3",
					system: "http://loinc.org",
					display: "Sentinel lymph nodes examined [#] in Cancer specimen by Light microscopy",
				},
			],
		},
		valueQuantity: {
			system: "http://unitsofmeasure.org",
			code: "1",
			value: 2,
			unit: "#",
		},
		status: "final",
		subject: {
			reference: "Patient/example",
		},
		effectiveDateTime: "2024-01-11",
	};

	const exampleMalignantLymphnodes: Observation = {
		resourceType: "Observation",
		id: "mii-exa-onko-anzahl-befallene-lymphknoten-0",
		meta: {
			profile: [
				"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-anzahl-befallene-lymphknoten",
			],
		},
		category: [
			{
				coding: [
					{
						code: "laboratory",
						system: "http://terminology.hl7.org/CodeSystem/observation-category",
					},
				],
			},
		],
		code: {
			coding: [
				{
					code: "21893-3",
					system: "http://loinc.org",
					display: "Regional lymph nodes positive [#] Specimen",
				},
			],
		},
		valueQuantity: {
			system: "http://unitsofmeasure.org",
			code: "1",
			value: 0,
			unit: "#",
		},
		status: "final",
		subject: {
			reference: "Patient/example",
		},
		effectiveDateTime: "2024-01-11",
	};

	const exampleMalignantSentinelLymphnodes: Observation = {
		resourceType: "Observation",
		id: "mii-exa-onko-anzahl-befallene-sentinel-lymphknoten-0",
		meta: {
			profile: [
				"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-anzahl-befallene-sentinel-lymphknoten",
			],
		},
		category: [
			{
				coding: [
					{
						code: "laboratory",
						system: "http://terminology.hl7.org/CodeSystem/observation-category",
					},
				],
			},
		],
		code: {
			coding: [
				{
					code: "92832-5",
					system: "http://loinc.org",
					display: "Sentinel lymph nodes with metastasis [#] in Cancer specimen",
				},
			],
		},
		valueQuantity: {
			system: "http://unitsofmeasure.org",
			code: "1",
			value: 0,
			unit: "#",
		},
		status: "final",
		subject: {
			reference: "Patient/example",
		},
		effectiveDateTime: "2024-01-11",
	};
</script>

<script lang="ts">
	import type { DiagnosticReport, Observation, Specimen as SpecimenType } from "fhir/r4";

	import Specimen from "./Specimen.svelte";
	import Grading from "./Grading.svelte";
	import LymphNodes from "./LymphNodes.svelte";

	interface Props {
		class?: string;
		specimen?: SpecimenType;
		befund?: DiagnosticReport;
		grading?: Observation;
		checkedLymphnodes?: Observation;
		checkedSentinelLymphnodes?: Observation;
		malignantLymphnodes?: Observation;
		malignantSentinelLymphnodes?: Observation;
	}

	let {
		class: classes,
		specimen = exampleSpecimen,
		befund = exampleBefund,
		grading = exampleGrading,
		checkedLymphnodes = exampleCheckedLymphnodes,
		checkedSentinelLymphnodes = exampleCheckedSentinelLymphnodes,
		malignantLymphnodes = exampleMalignantLymphnodes,
		malignantSentinelLymphnodes = exampleMalignantSentinelLymphnodes,
	}: Props = $props();

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

	// Helper function to get specimen information
	function getSpecimenInfo() {
		return {
			id: specimen.identifier?.[0]?.value || "Unbekannt",
			collectionDate: formatDate(specimen.collection?.collectedDateTime),
			status: specimen.status === "available" ? "Verfügbar" : specimen.status || "Unbekannt",
		};
	}

	// Helper function to get grading information
	function getGradingInfo() {
		const gradingCode = grading.valueCodeableConcept?.coding?.[0]?.code;
		const gradingMap: Record<string, string> = {
			"1": "G1 - Gut differenziert",
			"2": "G2 - Mäßig differenziert",
			"3": "G3 - Schlecht differenziert",
			"4": "G4 - Undifferenziert",
			"9": "GX - Differenzierungsgrad kann nicht bestimmt werden",
		};

		return {
			grade: gradingCode ? gradingMap[gradingCode] || `G${gradingCode}` : "Unbekannt",
			date: formatDate(grading.effectiveDateTime),
		};
	}

	// Helper function to get lymph node examination data
	function getLymphNodeInfo() {
		return {
			examined: {
				regional: checkedLymphnodes.valueQuantity?.value || 0,
				sentinel: checkedSentinelLymphnodes.valueQuantity?.value || 0,
			},
			positive: {
				regional: malignantLymphnodes.valueQuantity?.value || 0,
				sentinel: malignantSentinelLymphnodes.valueQuantity?.value || 0,
			},
			date: formatDate(checkedLymphnodes.effectiveDateTime),
		};
	}

	// Get data for display
	const specimenInfo = getSpecimenInfo();
	const gradingInfo = getGradingInfo();
	const lymphNodeInfo = getLymphNodeInfo();
</script>

<h3 class="font-xl mt-0">Histologie</h3>

<div class={["grid grid-cols-1 gap-8 md:grid-cols-2", classes]}>
	<!-- Specimen & Diagnostic Report Section -->
	<Specimen
		id={specimenInfo.id}
		collectionDate={specimenInfo.collectionDate}
		status={specimenInfo.status}
		{befund}
	/>

	<!-- Grading & Classification Section -->
	<Grading grade={gradingInfo.grade} date={gradingInfo.date} />
</div>

<!-- Lymph Node Section -->
<LymphNodes
	examined={lymphNodeInfo.examined}
	positive={lymphNodeInfo.positive}
	date={lymphNodeInfo.date}
/>
