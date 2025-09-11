<script module lang="ts">
	const example: Procedure = {
		resourceType: "Procedure",
		id: "mii-exa-onko-strahlentherapie",
		meta: {
			profile: [
				"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-strahlentherapie",
			],
		},
		extension: [
			{
				url: "https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-ex-onko-strahlentherapie-intention",
				valueCodeableConcept: {
					coding: [
						{
							code: "P",
							system:
								"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-intention",
						},
					],
				},
			},
			{
				url: "https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-ex-onko-strahlentherapie-bestrahlung",
				extension: [
					{
						url: "Applikationsart",
						valueCodeableConcept: {
							coding: [
								{
									code: "P-ST",
									system:
										"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-strahlentherapie-applikationsart",
								},
							],
						},
					},
					{
						url: "Strahlenart",
						valueCodeableConcept: {
							coding: [
								{
									code: "UH",
									system:
										"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-strahlentherapie-strahlenart",
								},
							],
						},
					},
					{
						url: "Zielgebiet",
						valueCodeableConcept: {
							coding: [
								{
									code: "3.4",
									system:
										"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-strahlentherapie-zielgebiet",
								},
							],
						},
					},
					{
						url: "Zielgebiet_Lateralitaet",
						valueCodeableConcept: {
							coding: [
								{
									code: "L",
									system:
										"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-seitenlokalisation",
								},
							],
						},
					},
					{
						url: "Gesamtdosis",
						valueQuantity: {
							value: 60,
							unit: "Gy",
						},
					},
					{
						url: "Einzeldosis",
						valueQuantity: {
							value: 12,
							unit: "Gy",
						},
					},
					{
						url: "Boost",
						valueCodeableConcept: {
							coding: [
								{
									code: "SIB",
									system:
										"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-strahlentherapie-boost",
								},
							],
						},
					},
				],
			},
			{
				url: "https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-ex-onko-strahlentherapie-stellung",
				valueCodeableConcept: {
					coding: [
						{
							code: "A",
							system:
								"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-therapie-stellung",
						},
					],
				},
			},
		],
		subject: {
			reference: "Patient/example",
		},
		status: "completed",
		code: {
			coding: [
				{
					code: "8-52",
					system: "http://fhir.de/CodeSystem/bfarm/ops",
				},
			],
		},
		performedPeriod: {
			start: "2019-07-04",
			end: "2019-09-14",
		},
	};
</script>

<script lang="ts">
	import type { Procedure } from "fhir/r4";

	import Treatment from "./Treatment.svelte";
	import RadiationDetails from "./RadiationDetails.svelte";
	import Dosage from "./Dosage.svelte";

	interface Props {
		class?: string;
		radiationTherapy?: Procedure;
	}

	let { class: classes, radiationTherapy = example }: Props = $props();

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
		const startDate = formatDate(radiationTherapy.performedPeriod?.start);
		const endDate = formatDate(radiationTherapy.performedPeriod?.end);
		return { startDate, endDate };
	}

	// Helper function to get radiation intention
	function getRadiationIntention() {
		const intentionExt = radiationTherapy.extension?.find(
			(ext) =>
				ext.url ===
				"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-ex-onko-strahlentherapie-intention"
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

	// Helper function to get radiation positioning
	function getRadiationPosition() {
		const positionExt = radiationTherapy.extension?.find(
			(ext) =>
				ext.url ===
				"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-ex-onko-strahlentherapie-stellung"
		);
		const positionCode = positionExt?.valueCodeableConcept?.coding?.[0]?.code;

		// Map position codes to German descriptions
		const positionMap: Record<string, string> = {
			A: "Adjuvant - Nach Operation",
			N: "Neoadjuvant - Vor Operation",
			S: "Simultan/Kombiniert mit anderer Therapie",
			I: "Intraoperativ",
			K: "Konsolidierend - Zur Festigung des Behandlungserfolgs",
		};

		return positionCode ? positionMap[positionCode] || positionCode : "Unbekannt";
	}

	// Helper function to get radiation details
	function getRadiationDetails() {
		const radiationExt = radiationTherapy.extension?.find(
			(ext) =>
				ext.url ===
				"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-ex-onko-strahlentherapie-bestrahlung"
		);

		if (!radiationExt?.extension) return null;

		// Get application method
		const applicationExt = radiationExt.extension.find((ext) => ext.url === "Applikationsart");
		const applicationCode = applicationExt?.valueCodeableConcept?.coding?.[0]?.code;
		const applicationMap: Record<string, string> = {
			"P-ST": "Perkutan - Stehfeld",
			"P-BW": "Perkutan - Bewegungsbestrahlung",
			"P-MF": "Perkutan - Mehrfeldertechnik",
			"P-IM": "Perkutan - Intensitätsmoduliert",
			"P-ST-IM": "Perkutan - Stereotaktisch und intensitätsmoduliert",
			"P-SO": "Perkutan - Sonstige",
			"K-IK": "Kontakt - Intrakavitär",
			"K-IS": "Kontakt - Interstitiell",
			"K-MO": "Kontakt - Moulage",
			"K-SO": "Kontakt - Sonstige",
			SO: "Sonstige",
		};
		const application = applicationCode
			? applicationMap[applicationCode] || applicationCode
			: "Unbekannt";

		// Get radiation type
		const typeExt = radiationExt.extension.find((ext) => ext.url === "Strahlenart");
		const typeCode = typeExt?.valueCodeableConcept?.coding?.[0]?.code;
		const typeMap: Record<string, string> = {
			UH: "Ultraharte Röntgenstrahlen / Photonen",
			EL: "Elektronen",
			PR: "Protonen",
			IO: "Ionen",
			NE: "Neutronen",
			PI: "Pi-Mesonen",
			HR: "Harte Röntgenstrahlen",
			WR: "Weiche Röntgenstrahlen",
			GA: "Gammastrahlen",
			BE: "Betastrahlen",
			SO: "Sonstige",
		};
		const type = typeCode ? typeMap[typeCode] || typeCode : "Unbekannt";

		// Get target area
		const targetExt = radiationExt.extension.find((ext) => ext.url === "Zielgebiet");
		const targetCode = targetExt?.valueCodeableConcept?.coding?.[0]?.code;
		const targetMap: Record<string, string> = {
			"1.0": "Zentralnervensystem",
			"2.0": "Kopf-Hals-Bereich",
			"3.0": "Thorax",
			"3.1": "Mamma",
			"3.2": "Lunge",
			"3.3": "Mediastinum",
			"3.4": "Brustwand",
			"4.0": "Abdomen",
			"5.0": "Becken",
			"6.0": "Extremitäten",
			"7.0": "Haut",
			"8.0": "Lymphabflusssystem",
			"9.0": "Knochenmetastasen",
			"10.0": "Ganzkörper",
		};
		const target = targetCode ? targetMap[targetCode] || targetCode : "Unbekannt";

		// Get laterality
		const lateralityExt = radiationExt.extension.find(
			(ext) => ext.url === "Zielgebiet_Lateralitaet"
		);
		const lateralityCode = lateralityExt?.valueCodeableConcept?.coding?.[0]?.code;
		const lateralityMap: Record<string, string> = {
			L: "Links",
			R: "Rechts",
			B: "Beidseitig",
			M: "Mittig",
			U: "Unbekannt",
		};
		const laterality = lateralityCode ? lateralityMap[lateralityCode] || lateralityCode : null;

		// Get dosage information
		const totalDoseExt = radiationExt.extension.find((ext) => ext.url === "Gesamtdosis");
		const totalDose = totalDoseExt?.valueQuantity?.value || null;
		const totalDoseUnit = totalDoseExt?.valueQuantity?.unit || "";

		const singleDoseExt = radiationExt.extension.find((ext) => ext.url === "Einzeldosis");
		const singleDose = singleDoseExt?.valueQuantity?.value || null;
		const singleDoseUnit = singleDoseExt?.valueQuantity?.unit || "";

		// Get boost information
		const boostExt = radiationExt.extension.find((ext) => ext.url === "Boost");
		const boostCode = boostExt?.valueCodeableConcept?.coding?.[0]?.code;
		const boostMap: Record<string, string> = {
			SEQ: "Sequentieller Boost",
			SIB: "Simultan integrierter Boost",
			K: "Kein Boost",
		};
		const boost = boostCode ? boostMap[boostCode] || boostCode : "Kein Boost";

		return {
			application,
			type,
			target,
			laterality,
			totalDose: totalDose !== null ? `${totalDose} ${totalDoseUnit}` : "Unbekannt",
			singleDose: singleDose !== null ? `${singleDose} ${singleDoseUnit}` : "Unbekannt",
			boost,
		};
	}

	// Get data for display
	const treatmentPeriod = getTreatmentPeriod();
	const radiationIntention = getRadiationIntention();
	const radiationPosition = getRadiationPosition();
	const radiationDetails = getRadiationDetails();
</script>

<h3 class="font-xl mt-0">Strahlentherapie</h3>

<div class={["grid grid-cols-1 gap-8 md:grid-cols-2", classes]}>
	<!-- Treatment Period and Intention Section -->
	<Treatment {treatmentPeriod} {radiationIntention} {radiationPosition} />

	<!-- Radiation Details Section -->
	{#if radiationDetails}
		<RadiationDetails {...radiationDetails} />
	{/if}
</div>

<!-- Dosage Information Section -->
{#if radiationDetails}
	<Dosage
		totalDose={radiationDetails.totalDose}
		singleDose={radiationDetails.singleDose}
		boost={radiationDetails.boost}
	/>
{/if}
