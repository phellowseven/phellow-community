<script module>
	const example: Condition = {
		resourceType: "Condition",
		id: "mii-exa-onko-diagnose",
		meta: {
			profile: [
				"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-diagnose",
			],
		},
		code: {
			coding: [
				{
					system: "http://fhir.de/CodeSystem/bfarm/icd-10-gm",
					extension: [
						{
							url: "http://fhir.de/StructureDefinition/seitenlokalisation",
							valueCoding: {
								code: "R",
								system: "https://fhir.kbv.de/CodeSystem/KBV_CS_SFHIR_ICD_SEITENLOKALISATION",
								display: "rechts",
							},
						},
					],
					code: "C50.4",
					version: "2020",
					display: "Oberer äußerer Quadrant der Brustdrüse",
				},
				{
					system: "http://terminology.hl7.org/CodeSystem/icd-o-3",
					code: "8500/3",
					display: "Invasives duktales Karzinom o.n.A. [C50.-]",
				},
			],
		},
		verificationStatus: {
			coding: [
				{
					system: "http://terminology.hl7.org/CodeSystem/condition-ver-status",
					code: "confirmed",
				},
				{
					system:
						"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-primaertumor-diagnosesicherung",
					code: "7",
					display: "histologische Untersuchung eines Primärtumors",
				},
			],
		},
		bodySite: [
			{
				coding: [
					{
						system: "http://snomed.info/sct",
						code: "76365002",
						display: "Structure of upper outer quadrant of breast (body structure)",
					},
					{
						system: "http://terminology.hl7.org/CodeSystem/icd-o-3",
						code: "C50.4",
						display: "Oberer äußerer Quadrant der Brust",
					},
				],
			},
		],
		clinicalStatus: {
			coding: [
				{
					code: "active",
					system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
				},
			],
		},
		subject: {
			reference: "Patient/example",
		},
		recordedDate: "2020-02-16",
	};
</script>

<script lang="ts">
	import type { Condition } from "fhir/r4";
	import Calendar from "@lucide/svelte/icons/calendar";
	import PrimaryDiagnosis from "./PrimaryDiagnosis.svelte";
	import DiagnosisStatus from "./DiagnosisStatus.svelte";

	interface Props {
		class?: string;
		condition?: Condition;
	}

	let { class: classes, condition = example }: Props = $props();

	// Helper function to get primary diagnosis
	function getPrimaryDiagnosis() {
		const icdCoding = condition.code?.coding?.find(
			(coding) => coding.system === "http://fhir.de/CodeSystem/bfarm/icd-10-gm"
		);

		const morphologyCoding = condition.code?.coding?.find(
			(coding) => coding.system === "http://terminology.hl7.org/CodeSystem/icd-o-3"
		);

		return {
			icd: icdCoding
				? {
						code: icdCoding.code,
						display: icdCoding.display,
						side: icdCoding?.extension?.find(
							(ext) => ext.url === "http://fhir.de/StructureDefinition/seitenlokalisation"
						)?.valueCoding?.display,
					}
				: null,
			morphology: morphologyCoding
				? {
						code: morphologyCoding.code,
						display: morphologyCoding.display,
					}
				: null,
		};
	}

	// Helper function to get verification status
	function getVerificationStatus() {
		const statusCoding = condition.verificationStatus?.coding?.find(
			(coding) =>
				coding.system ===
				"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-primaertumor-diagnosesicherung"
		);

		return statusCoding?.display || "Unbekannt";
	}

	// Helper function to get clinical status
	function getClinicalStatus() {
		const clinicalCoding = condition.clinicalStatus?.coding?.[0];
		if (!clinicalCoding) return "Unbekannt";

		// Map status codes to German text
		const statusMap = {
			active: "Aktiv",
			recurrence: "Wiederaufgetreten",
			relapse: "Rezidiv",
			inactive: "Inaktiv",
			remission: "Remission",
			resolved: "Abgeschlossen",
		};

		return statusMap[clinicalCoding.code as keyof typeof statusMap] || clinicalCoding.code;
	}

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

	// Get diagnosis data
	const primaryDiagnosis = getPrimaryDiagnosis();
	const verificationStatus = getVerificationStatus();
	const clinicalStatus = getClinicalStatus();
	const diagnosisDate = formatDate(condition.recordedDate);

	// Get body site
	const bodySite = condition.bodySite?.[0].coding?.find(
		(coding) => coding.system === "http://snomed.info/sct"
	);
</script>

<h3 class="font-xl mt-0">Diagnosedetails</h3>

<div class="flex items-start gap-2">
	<Calendar class="mt-0.5 shrink-0" size={16} />
	<div>
		<div class="font-medium">Diagnosedatum</div>
		<div class="text-muted-foreground">{diagnosisDate}</div>
	</div>
</div>

<div class={["grid grid-cols-1 gap-8 md:grid-cols-2", classes]}>
	<!-- Primary Diagnosis Section -->
	<PrimaryDiagnosis
		icd={primaryDiagnosis.icd}
		morphology={primaryDiagnosis.morphology}
		{bodySite}
	/>

	<!-- Status Section -->
	<DiagnosisStatus {verificationStatus} {clinicalStatus} />
</div>
