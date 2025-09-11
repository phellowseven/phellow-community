<script module lang="ts">
	const exampleProcedure: Procedure = {
		resourceType: "Procedure",
		id: "PatientKimMusterperson-SystemicTherapy-1",
		meta: {
			profile: [
				"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-systemische-therapie",
			],
		},
		extension: [
			{
				url: "https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-ex-onko-systemische-therapie-intention",
				valueCodeableConcept: {
					coding: [
						{
							code: "K",
							system:
								"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-intention",
						},
					],
				},
			},
			{
				url: "https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-ex-onko-systemische-therapie-stellungzurop",
				valueCodeableConcept: {
					coding: [
						{
							code: "N",
							system:
								"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-therapie-stellungzurop",
							display: "neoadjuvant",
						},
					],
				},
			},
		],
		subject: {
			reference: "Patient/PatientKimMusterperson",
		},
		status: "completed",
		category: {
			coding: [
				{
					code: "18629005",
					system: "http://snomed.info/sct",
				},
			],
		},
		code: {
			coding: [
				{
					code: "8-54",
					system: "http://fhir.de/CodeSystem/bfarm/ops",
					display: "Zytostatische Chemotherapie, Immuntherapie und antiretrovirale Therapie",
				},
			],
		},
		performedPeriod: {
			start: "2021-07-05",
			end: "2021-09-05",
		},
		basedOn: [
			{
				reference: "CarePlan/PatientKimMusterperson-Tumorkonferenz-1",
			},
		],
	};

	const exampleMedication: MedicationStatement = {
		resourceType: "MedicationStatement",
		id: "mii-exa-onko-systemische-therapie-medikation1",
		meta: {
			profile: [
				"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-systemische-therapie-medikation",
			],
		},
		subject: {
			reference: "Patient/example",
		},
		status: "completed",
		effectivePeriod: {
			start: "2021-12-04",
			end: "2022-04-06",
		},
		medicationCodeableConcept: {
			coding: [
				{
					system: "http://fhir.de/CodeSystem/bfarm/atc",
					code: "L01AA01",
					version: "2022",
					display: "Cyclophosphamid",
				},
			],
		},
		partOf: [
			{
				reference: "Procedure/mii-exa-onko-systemische-therapie-1",
			},
		],
		note: [
			{
				text: "AC",
			},
		],
	};
</script>

<script lang="ts">
	import type { MedicationStatement, Procedure } from "fhir/r4";

	import Therapy from "./Therapy.svelte";
	import Medication from "./Medication.svelte";

	interface Props {
		class?: string;
		procedure?: Procedure;
		medication?: MedicationStatement;
	}

	let {
		class: classes,
		procedure = exampleProcedure,
		medication = exampleMedication,
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

	// Helper function to get treatment period
	function getTreatmentPeriod() {
		const startDate = formatDate(procedure.performedPeriod?.start);
		const endDate = formatDate(procedure.performedPeriod?.end);
		return { startDate, endDate };
	}

	// Helper function to get medication period
	function getMedicationPeriod() {
		const startDate = formatDate(medication.effectivePeriod?.start);
		const endDate = formatDate(medication.effectivePeriod?.end);
		return { startDate, endDate };
	}

	// Helper function to get therapy type
	function getTherapyType() {
		const therapyCode = procedure.code?.coding?.[0];
		return therapyCode?.display || "Systemische Therapie";
	}

	// Helper function to get therapy intention
	function getTherapyIntention() {
		const intentionExt = procedure.extension?.find(
			(ext) =>
				ext.url ===
				"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-ex-onko-systemische-therapie-intention"
		);
		const intentionCode = intentionExt?.valueCodeableConcept?.coding?.[0]?.code;

		// Map intention codes to German descriptions
		const intentionMap: Record<string, string> = {
			K: "Kurativ - Heilung als Ziel",
			P: "Palliativ - Linderung von Beschwerden",
			N: "Neoadjuvant - Vorbehandlung vor OP",
			A: "Adjuvant - Nachbehandlung nach OP",
			S: "Sonstiges",
		};

		return intentionCode ? intentionMap[intentionCode] || intentionCode : "Unbekannt";
	}

	// Helper function to get surgical positioning
	function getSurgicalPosition() {
		const positionExt = procedure.extension?.find(
			(ext) =>
				ext.url ===
				"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-ex-onko-systemische-therapie-stellungzurop"
		);
		const positionCode = positionExt?.valueCodeableConcept?.coding?.[0]?.code;
		const positionDisplay = positionExt?.valueCodeableConcept?.coding?.[0]?.display;

		// Map position codes to German descriptions
		const positionMap: Record<string, string> = {
			A: "Adjuvant - Nach der Operation",
			N: "Neoadjuvant - Vor der Operation",
			S: "Simultan - Gleichzeitig mit anderer Therapie",
			K: "Konsolidierend",
			P: "Palliativ",
		};

		return (
			positionDisplay || (positionCode ? positionMap[positionCode] || positionCode : "Unbekannt")
		);
	}

	// Helper function to get medication information
	function getMedicationInfo() {
		const medicationCoding = medication.medicationCodeableConcept?.coding?.[0];
		const medicationName = medicationCoding?.display || "Unbekannt";
		const medicationCode = medicationCoding?.code || "";
		const protocol = medication.note?.[0]?.text || "Nicht angegeben";
		const status =
			medication.status === "completed"
				? "Abgeschlossen"
				: medication.status === "active"
					? "Aktiv"
					: medication.status || "Unbekannt";

		return { medicationName, medicationCode, protocol, status };
	}

	// Get data for display
	const treatmentPeriod = getTreatmentPeriod();
	const medicationPeriod = getMedicationPeriod();
	const therapyType = getTherapyType();
	const therapyIntention = getTherapyIntention();
	const surgicalPosition = getSurgicalPosition();
	const medicationInfo = getMedicationInfo();
</script>

<h3 class="font-xl mt-0">Systemische Therapie</h3>

<div class={["grid grid-cols-1 gap-8 md:grid-cols-2", classes]}>
	<!-- Therapy Information Section -->
	<Therapy {therapyType} {treatmentPeriod} {therapyIntention} {surgicalPosition} />

	<!-- Medication Information Section -->
	<Medication {medicationInfo} {medicationPeriod} />
</div>
