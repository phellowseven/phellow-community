// types/fhir.ts
import type { Bundle, CodeableConcept, Observation, Quantity } from 'fhir/r4';

type ObservationEntry = {
	resource: Observation;
	fullUrl: string;
};

type ObservationBundle = Omit<Bundle, 'entry'> & {
	entry: ObservationEntry[];
};

interface ReferenceRange {
	low?: Quantity;
	high?: Quantity;
	type?: {
		coding: Array<{
			system: string;
			code: string;
			display: string;
		}>;
		text: string;
	};
}

// Common reference ranges by LOINC code or observation text
const REFERENCE_RANGES: Record<string, ReferenceRange> = {
	// Laboratory Values
	'26464-8': {
		// Leukocytes
		low: { value: 4.0, unit: '10*9/L', system: 'http://unitsofmeasure.org' },
		high: { value: 10.0, unit: '10*9/L', system: 'http://unitsofmeasure.org' }
	},
	'59260-0': {
		// Hemoglobin
		low: { value: 13.5, unit: 'g/dL', system: 'http://unitsofmeasure.org' },
		high: { value: 17.5, unit: 'g/dL', system: 'http://unitsofmeasure.org' }
	},
	'20570-8': {
		// Hematocrit
		low: { value: 35, unit: '%', system: 'http://unitsofmeasure.org' },
		high: { value: 45, unit: '%', system: 'http://unitsofmeasure.org' }
	},
	'26515-7': {
		// Platelets
		low: { value: 150, unit: '10*9/L', system: 'http://unitsofmeasure.org' },
		high: { value: 450, unit: '10*9/L', system: 'http://unitsofmeasure.org' }
	},
	'2947-0': {
		// Sodium
		low: { value: 135, unit: 'mmol/L', system: 'http://unitsofmeasure.org' },
		high: { value: 145, unit: 'mmol/L', system: 'http://unitsofmeasure.org' }
	},
	'6298-4': {
		// Potassium
		low: { value: 3.5, unit: 'mmol/L', system: 'http://unitsofmeasure.org' },
		high: { value: 5.1, unit: 'mmol/L', system: 'http://unitsofmeasure.org' }
	},
	'2160-0': {
		// Creatinine
		low: { value: 0.7, unit: 'mg/dL', system: 'http://unitsofmeasure.org' },
		high: { value: 1.2, unit: 'mg/dL', system: 'http://unitsofmeasure.org' }
	},
	'1920-8': {
		// AST
		high: { value: 40, unit: 'U/L', system: 'http://unitsofmeasure.org' }
	},
	'1742-6': {
		// ALT
		high: { value: 41, unit: 'U/L', system: 'http://unitsofmeasure.org' }
	},
	'2324-2': {
		// GGT
		high: { value: 60, unit: 'U/L', system: 'http://unitsofmeasure.org' }
	},
	'1996-8': {
		// Calcium
		low: { value: 8.5, unit: 'mg/dL', system: 'http://unitsofmeasure.org' },
		high: { value: 10.2, unit: 'mg/dL', system: 'http://unitsofmeasure.org' }
	},

	// Vital Signs
	'8480-6': {
		// Systolic Blood Pressure
		low: { value: 90, unit: 'mm[Hg]', system: 'http://unitsofmeasure.org' },
		high: { value: 140, unit: 'mm[Hg]', system: 'http://unitsofmeasure.org' }
	},
	'8462-4': {
		// Diastolic Blood Pressure
		low: { value: 60, unit: 'mm[Hg]', system: 'http://unitsofmeasure.org' },
		high: { value: 90, unit: 'mm[Hg]', system: 'http://unitsofmeasure.org' }
	},
	'8867-4': {
		// Heart Rate
		low: { value: 60, unit: '/min', system: 'http://unitsofmeasure.org' },
		high: { value: 100, unit: '/min', system: 'http://unitsofmeasure.org' }
	},
	'8310-5': {
		// Body Temperature
		low: { value: 36.5, unit: 'Cel', system: 'http://unitsofmeasure.org' },
		high: { value: 37.5, unit: 'Cel', system: 'http://unitsofmeasure.org' }
	}
};

interface CategoryMapping {
	category: CodeableConcept[];
}

// Detailed category mappings by LOINC code
const CATEGORY_MAPPINGS: Record<string, CategoryMapping> = {
	// Hematology
	'26464-8': {
		// Leukocytes
		category: [
			{
				coding: [
					{
						system: 'http://terminology.hl7.org/CodeSystem/observation-category',
						code: 'laboratory',
						display: 'Laboratory'
					}
				],
				text: 'Laboratory'
			}
		]
	},
	'59260-0': {
		// Hemoglobin
		category: [
			{
				coding: [
					{
						system: 'http://terminology.hl7.org/CodeSystem/observation-category',
						code: 'laboratory',
						display: 'Laboratory'
					}
				],
				text: 'Laboratory'
			}
		]
	},

	// Chemistry
	'2947-0': {
		// Sodium
		category: [
			{
				coding: [
					{
						system: 'http://terminology.hl7.org/CodeSystem/observation-category',
						code: 'laboratory',
						display: 'Laboratory'
					}
				],
				text: 'Laboratory'
			}
		]
	},
	'6298-4': {
		// Potassium
		category: [
			{
				coding: [
					{
						system: 'http://terminology.hl7.org/CodeSystem/observation-category',
						code: 'laboratory',
						display: 'Laboratory'
					}
				],
				text: 'Laboratory'
			}
		]
	},

	// Liver Function
	'1920-8': {
		// AST
		category: [
			{
				coding: [
					{
						system: 'http://terminology.hl7.org/CodeSystem/observation-category',
						code: 'laboratory',
						display: 'Laboratory'
					}
				],
				text: 'Laboratory'
			}
		]
	},
	'1742-6': {
		// ALT
		category: [
			{
				coding: [
					{
						system: 'http://terminology.hl7.org/CodeSystem/observation-category',
						code: 'laboratory',
						display: 'Laboratory'
					}
				],
				text: 'Laboratory'
			}
		]
	},

	// Vital Signs
	'8480-6': {
		// Systolic BP
		category: [
			{
				coding: [
					{
						system: 'http://terminology.hl7.org/CodeSystem/observation-category',
						code: 'vital-signs',
						display: 'Vital Signs'
					}
				],
				text: 'Vital Signs'
			}
		]
	},
	'8867-4': {
		// Heart Rate
		category: [
			{
				coding: [
					{
						system: 'http://terminology.hl7.org/CodeSystem/observation-category',
						code: 'vital-signs',
						display: 'Vital Signs'
					}
				],
				text: 'Vital Signs'
			}
		]
	},

	// Coagulation
	'5902-2': {
		// PT
		category: [
			{
				coding: [
					{
						system: 'http://terminology.hl7.org/CodeSystem/observation-category',
						code: 'laboratory',
						display: 'Laboratory'
					}
				],
				text: 'Laboratory'
			}
		]
	}
};

// Text-based category mapping for observations without LOINC codes
const TEXT_BASED_CATEGORIES: Record<string, CategoryMapping> = {
	Blutdruck: {
		category: [
			{
				coding: [
					{
						system: 'http://terminology.hl7.org/CodeSystem/observation-category',
						code: 'vital-signs',
						display: 'Vital Signs'
					}
				],
				text: 'Vital Signs'
			}
		]
	},
	Körpertemperatur: {
		category: [
			{
				coding: [
					{
						system: 'http://terminology.hl7.org/CodeSystem/observation-category',
						code: 'vital-signs',
						display: 'Vital Signs'
					}
				],
				text: 'Vital Signs'
			}
		]
	}
};

/**
 * Enhances FHIR Observations with detailed clinical categories
 * @param bundle FHIR Bundle containing Observations
 * @returns Updated bundle with enhanced categories
 */
export function addCategories(bundle: ObservationBundle): ObservationBundle {
	const updatedBundle = structuredClone(bundle);

	updatedBundle.entry = updatedBundle.entry.map((entry) => {
		const observation = entry.resource;

		// Get LOINC code if available
		const loincCode = observation.code?.coding?.find(
			(coding) => coding.system === 'http://loinc.org'
		)?.code;

		// Try to find category mapping by LOINC code first, then by text
		let categoryMapping = loincCode ? CATEGORY_MAPPINGS[loincCode] : undefined;

		if (!categoryMapping && observation.code?.text) {
			// Try to find by partial text match
			const matchingText = Object.keys(TEXT_BASED_CATEGORIES).find((key) =>
				observation.code.text?.includes(key)
			);
			if (matchingText) {
				categoryMapping = TEXT_BASED_CATEGORIES[matchingText];
			}
		}

		// Apply categories if found
		if (categoryMapping) {
			observation.category = categoryMapping.category;
		}

		return entry;
	});

	return updatedBundle;
}

/**
 * Adds reference ranges to FHIR Observations based on their LOINC codes or observation text
 * @param bundle FHIR Bundle containing Observations
 * @returns Updated bundle with reference ranges
 */
function addReferenceRanges(bundle: ObservationBundle): ObservationBundle {
	const updatedBundle = structuredClone(bundle);

	updatedBundle.entry = updatedBundle.entry.map((entry) => {
		const observation = entry.resource;

		// Get LOINC code if available
		const loincCode = observation.code?.coding?.find(
			(coding) => coding.system === 'http://loinc.org'
		)?.code;

		// Get reference range based on LOINC code or observation text
		const range = loincCode
			? REFERENCE_RANGES[loincCode]
			: REFERENCE_RANGES[observation.code?.text || ''];

		if (range && observation.valueQuantity) {
			observation.referenceRange = [
				{
					low: range.low,
					high: range.high,
					type: range.type || {
						coding: [
							{
								system: 'http://terminology.hl7.org/CodeSystem/referencerange-meaning',
								code: 'normal',
								display: 'Normal Range'
							}
						],
						text: 'Normal Range'
					}
				}
			];
		}

		return entry;
	});

	return updatedBundle;
}

// Utility to check if a value is within reference range
function isWithinRange(value: number, range: ReferenceRange): boolean {
	const isAboveLow = !range.low?.value || value >= range.low.value;
	const isBelowHigh = !range.high?.value || value <= range.high.value;
	return isAboveLow && isBelowHigh;
}

function handleObservations(originalBundle: ObservationBundle) {
	const bundleWithRanges = addReferenceRanges(originalBundle);
	const bundleWithCategories = addCategories(bundleWithRanges);

	// Optional: Add flags for values outside reference range
	bundleWithCategories.entry.forEach((entry) => {
		const obs = entry.resource;
		if (obs.valueQuantity && obs.referenceRange?.[0]) {
			const value = obs.valueQuantity.value;
			const range = {
				low: obs.referenceRange[0].low,
				high: obs.referenceRange[0].high
			};

			if (!value || !range.low || !range.high) {
				return;
			}

			if (!isWithinRange(value, range)) {
				// Add interpretation
				obs.interpretation = [
					{
						coding: [
							{
								system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
								code: value < (range.low?.value || 0) ? 'L' : 'H',
								display: value < (range.low?.value || 0) ? 'Low' : 'High'
							}
						]
					}
				];
			}
		}
	});

	return bundleWithCategories;
}

/**
 * Randomly samples N entries from a FHIR Observation Bundle
 * @param bundle The FHIR Bundle containing Observations
 * @param n Number of entries to sample
 * @returns Array of randomly selected ObservationEntries
 * @throws Error if n is greater than available entries
 */
export function sampleObservations(bundle: ObservationBundle, n: number): ObservationBundle {
	if (!bundle.entry || bundle.entry.length === 0) {
		throw new Error('Bundle contains no entries');
	}

	if (n < 0) {
		throw new Error('Sample size must be positive');
	}

	if (n > bundle.entry.length) {
		throw new Error(
			`Cannot sample ${n} entries from bundle with only ${bundle.entry.length} entries`
		);
	}

	// Fisher-Yates shuffle algorithm for unbiased sampling
	const shuffled = [...bundle.entry].filter(
		(entry) => entry.resource.valueQuantity?.value !== undefined
	);
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}

	const sample = shuffled.slice(0, n);
	const newBundle = structuredClone(bundle);
	newBundle.entry = sample;
	newBundle.total = n;
	return newBundle;
}

import fs from 'fs';
import bundleJson from '../samples/fhir/observations.json';

const bundle: ObservationBundle = bundleJson as ObservationBundle;

const sampled100 = handleObservations(sampleObservations(bundle, 100));
const sampled200 = handleObservations(sampleObservations(bundle, 200));
const sampled400 = handleObservations(sampleObservations(bundle, 400));
const sampled1000 = handleObservations(sampleObservations(bundle, 1000));

// Write the sampled observations to a file
fs.writeFileSync('observations_100.json', JSON.stringify(sampled100, null, 2), 'utf-8');
fs.writeFileSync('observations_200.json', JSON.stringify(sampled200, null, 2), 'utf-8');
fs.writeFileSync('observations_400.json', JSON.stringify(sampled400, null, 2), 'utf-8');
fs.writeFileSync('observations_1000.json', JSON.stringify(sampled1000, null, 2), 'utf-8');

console.log('Sampled observations written to sampledObservations.json');

// RUN WITH:
// npx tsc sampleObservations.ts --resolveJsonModule --esModuleInterop
// mv sampleObservations.js sampleObservations.cjs
// node sampleObservations.cjs
