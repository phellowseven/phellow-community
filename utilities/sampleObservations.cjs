"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCategories = addCategories;
exports.sampleObservations = sampleObservations;
// Common reference ranges by LOINC code or observation text
var REFERENCE_RANGES = {
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
// Detailed category mappings by LOINC code
var CATEGORY_MAPPINGS = {
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
var TEXT_BASED_CATEGORIES = {
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
function addCategories(bundle) {
    var updatedBundle = structuredClone(bundle);
    updatedBundle.entry = updatedBundle.entry.map(function (entry) {
        var _a, _b, _c, _d;
        var observation = entry.resource;
        // Get LOINC code if available
        var loincCode = (_c = (_b = (_a = observation.code) === null || _a === void 0 ? void 0 : _a.coding) === null || _b === void 0 ? void 0 : _b.find(function (coding) { return coding.system === 'http://loinc.org'; })) === null || _c === void 0 ? void 0 : _c.code;
        // Try to find category mapping by LOINC code first, then by text
        var categoryMapping = loincCode ? CATEGORY_MAPPINGS[loincCode] : undefined;
        if (!categoryMapping && ((_d = observation.code) === null || _d === void 0 ? void 0 : _d.text)) {
            // Try to find by partial text match
            var matchingText = Object.keys(TEXT_BASED_CATEGORIES).find(function (key) { var _a; return (_a = observation.code.text) === null || _a === void 0 ? void 0 : _a.includes(key); });
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
function addReferenceRanges(bundle) {
    var updatedBundle = structuredClone(bundle);
    updatedBundle.entry = updatedBundle.entry.map(function (entry) {
        var _a, _b, _c, _d;
        var observation = entry.resource;
        // Get LOINC code if available
        var loincCode = (_c = (_b = (_a = observation.code) === null || _a === void 0 ? void 0 : _a.coding) === null || _b === void 0 ? void 0 : _b.find(function (coding) { return coding.system === 'http://loinc.org'; })) === null || _c === void 0 ? void 0 : _c.code;
        // Get reference range based on LOINC code or observation text
        var range = loincCode
            ? REFERENCE_RANGES[loincCode]
            : REFERENCE_RANGES[((_d = observation.code) === null || _d === void 0 ? void 0 : _d.text) || ''];
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
function isWithinRange(value, range) {
    var _a, _b;
    var isAboveLow = !((_a = range.low) === null || _a === void 0 ? void 0 : _a.value) || value >= range.low.value;
    var isBelowHigh = !((_b = range.high) === null || _b === void 0 ? void 0 : _b.value) || value <= range.high.value;
    return isAboveLow && isBelowHigh;
}
function handleObservations(originalBundle) {
    var bundleWithRanges = addReferenceRanges(originalBundle);
    var bundleWithCategories = addCategories(bundleWithRanges);
    // Optional: Add flags for values outside reference range
    bundleWithCategories.entry.forEach(function (entry) {
        var _a, _b, _c;
        var obs = entry.resource;
        if (obs.valueQuantity && ((_a = obs.referenceRange) === null || _a === void 0 ? void 0 : _a[0])) {
            var value = obs.valueQuantity.value;
            var range = {
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
                                code: value < (((_b = range.low) === null || _b === void 0 ? void 0 : _b.value) || 0) ? 'L' : 'H',
                                display: value < (((_c = range.low) === null || _c === void 0 ? void 0 : _c.value) || 0) ? 'Low' : 'High'
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
function sampleObservations(bundle, n) {
    var _a;
    if (!bundle.entry || bundle.entry.length === 0) {
        throw new Error('Bundle contains no entries');
    }
    if (n < 0) {
        throw new Error('Sample size must be positive');
    }
    if (n > bundle.entry.length) {
        throw new Error("Cannot sample ".concat(n, " entries from bundle with only ").concat(bundle.entry.length, " entries"));
    }
    // Fisher-Yates shuffle algorithm for unbiased sampling
    var shuffled = __spreadArray([], bundle.entry, true).filter(function (entry) { var _a; return ((_a = entry.resource.valueQuantity) === null || _a === void 0 ? void 0 : _a.value) !== undefined; });
    for (var i = shuffled.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        _a = [shuffled[j], shuffled[i]], shuffled[i] = _a[0], shuffled[j] = _a[1];
    }
    var sample = shuffled.slice(0, n);
    var newBundle = structuredClone(bundle);
    newBundle.entry = sample;
    newBundle.total = n;
    return newBundle;
}
var fs_1 = __importDefault(require("fs"));
var observations_json_1 = __importDefault(require("../samples/fhir/observations.json"));
var bundle = observations_json_1.default;
var sampled100 = handleObservations(sampleObservations(bundle, 100));
var sampled200 = handleObservations(sampleObservations(bundle, 200));
var sampled400 = handleObservations(sampleObservations(bundle, 400));
var sampled1000 = handleObservations(sampleObservations(bundle, 1000));
// Write the sampled observations to a file
fs_1.default.writeFileSync('observations_100.json', JSON.stringify(sampled100, null, 2), 'utf-8');
fs_1.default.writeFileSync('observations_200.json', JSON.stringify(sampled200, null, 2), 'utf-8');
fs_1.default.writeFileSync('observations_400.json', JSON.stringify(sampled400, null, 2), 'utf-8');
fs_1.default.writeFileSync('observations_1000.json', JSON.stringify(sampled1000, null, 2), 'utf-8');
console.log('Sampled observations written to sampledObservations.json');
// RUN WITH:
// npx tsc sampleObservations.ts --resolveJsonModule --esModuleInterop
// mv sampleObservations.js sampleObservations.cjs
// node sampleObservations.cjs
