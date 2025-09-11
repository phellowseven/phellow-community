import type { Bundle, Condition, Observation, Procedure } from "fhir/r4";
import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { parseFHIRBundle } from "./parseBundle";

describe("parseFHIRBundle", () => {
	it("should return empty array for bundle without entries", () => {
		const bundle: Bundle = {
			resourceType: "Bundle",
			type: "collection",
		};

		const result = parseFHIRBundle(bundle);
		expect(result).toEqual([]);
	});

	it("should return empty array for bundle with empty entries", () => {
		const bundle: Bundle = {
			resourceType: "Bundle",
			type: "collection",
			entry: [],
		};

		const result = parseFHIRBundle(bundle);
		expect(result).toEqual([]);
	});

	it("should parse diagnosis condition with mii-pr-onko-diagnose profile", () => {
		const condition: Condition = {
			resourceType: "Condition",
			id: "diagnosis-1",
			meta: {
				profile: [
					"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-diagnose",
				],
			},
			subject: { reference: "Patient/example" },
			recordedDate: "2023-01-15T10:30:00Z",
			code: {
				coding: [
					{
						system: "http://snomed.info/sct",
						code: "363346000",
						display: "Malignant neoplasm",
					},
				],
			},
		};

		const bundle: Bundle = {
			resourceType: "Bundle",
			type: "collection",
			entry: [{ resource: condition }],
		};

		const result = parseFHIRBundle(bundle);
		expect(result).toHaveLength(1);
		expect(result[0]).toEqual({
			startDate: new Date("2023-01-15T10:30:00Z"),
			type: "diagnosis",
			resourceId: "diagnosis-1",
		});
	});

	it("should parse surgery procedure with mii-pr-onko-operation profile", () => {
		const procedure: Procedure = {
			resourceType: "Procedure",
			id: "surgery-1",
			meta: {
				profile: [
					"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-operation",
				],
			},
			status: "completed",
			subject: { reference: "Patient/example" },
			performedDateTime: "2023-02-20T14:00:00Z",
			code: {
				coding: [
					{
						system: "http://snomed.info/sct",
						code: "387713003",
						display: "Surgical procedure",
					},
				],
			},
		};

		const bundle: Bundle = {
			resourceType: "Bundle",
			type: "collection",
			entry: [{ resource: procedure }],
		};

		const result = parseFHIRBundle(bundle);
		expect(result).toHaveLength(1);
		expect(result[0]).toEqual({
			startDate: new Date("2023-02-20T14:00:00Z"),
			type: "surgery",
			resourceId: "surgery-1",
		});
	});

	it("should parse surgery procedure with period and end date", () => {
		const procedure: Procedure = {
			resourceType: "Procedure",
			id: "surgery-2",
			meta: {
				profile: [
					"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-operation",
				],
			},
			status: "completed",
			subject: { reference: "Patient/example" },
			performedPeriod: {
				start: "2023-02-20T14:00:00Z",
				end: "2023-02-20T18:00:00Z",
			},
			code: {
				coding: [
					{
						system: "http://snomed.info/sct",
						code: "387713003",
						display: "Surgical procedure",
					},
				],
			},
		};

		const bundle: Bundle = {
			resourceType: "Bundle",
			type: "collection",
			entry: [{ resource: procedure }],
		};

		const result = parseFHIRBundle(bundle);
		expect(result).toHaveLength(1);
		expect(result[0]).toEqual({
			startDate: new Date("2023-02-20T14:00:00Z"),
			endDate: new Date("2023-02-20T18:00:00Z"),
			type: "surgery",
			resourceId: "surgery-2",
		});
	});

	it("should parse radiation therapy procedure with mii-pr-onko-strahlentherapie profile", () => {
		const procedure: Procedure = {
			resourceType: "Procedure",
			id: "radiation-1",
			meta: {
				profile: [
					"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-strahlentherapie",
				],
			},
			status: "completed",
			subject: { reference: "Patient/example" },
			performedDateTime: "2023-03-10T09:00:00Z",
			code: {
				coding: [
					{
						system: "http://snomed.info/sct",
						code: "108290001",
						display: "Radiation therapy",
					},
				],
			},
		};

		const bundle: Bundle = {
			resourceType: "Bundle",
			type: "collection",
			entry: [{ resource: procedure }],
		};

		const result = parseFHIRBundle(bundle);
		expect(result).toHaveLength(1);
		expect(result[0]).toEqual({
			startDate: new Date("2023-03-10T09:00:00Z"),
			type: "radiation",
			resourceId: "radiation-1",
		});
	});

	it("should parse systemic therapy procedure with mii-pr-onko-systemische-therapie profile", () => {
		const procedure: Procedure = {
			resourceType: "Procedure",
			id: "systemic-1",
			meta: {
				profile: [
					"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-systemische-therapie",
				],
			},
			status: "completed",
			subject: { reference: "Patient/example" },
			performedPeriod: {
				start: "2023-04-01T08:00:00Z",
				end: "2023-04-30T17:00:00Z",
			},
			code: {
				coding: [
					{
						system: "http://snomed.info/sct",
						code: "277132007",
						display: "Therapeutic procedure",
					},
				],
			},
		};

		const bundle: Bundle = {
			resourceType: "Bundle",
			type: "collection",
			entry: [{ resource: procedure }],
		};

		const result = parseFHIRBundle(bundle);
		expect(result).toHaveLength(1);
		expect(result[0]).toEqual({
			startDate: new Date("2023-04-01T08:00:00Z"),
			endDate: new Date("2023-04-30T17:00:00Z"),
			type: "systemicTherapy",
			resourceId: "systemic-1",
		});
	});

	it("should parse progression observation with mii-pr-onko-verlauf profile", () => {
		const observation: Observation = {
			resourceType: "Observation",
			id: "progression-1",
			meta: {
				profile: [
					"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-verlauf",
				],
			},
			status: "final",
			subject: { reference: "Patient/example" },
			effectiveDateTime: "2023-05-15T11:30:00Z",
			code: {
				coding: [
					{
						system: "http://snomed.info/sct",
						code: "246901002",
						display: "Progression",
					},
				],
			},
		};

		const bundle: Bundle = {
			resourceType: "Bundle",
			type: "collection",
			entry: [{ resource: observation }],
		};

		const result = parseFHIRBundle(bundle);
		expect(result).toHaveLength(1);
		expect(result[0]).toEqual({
			startDate: new Date("2023-05-15T11:30:00Z"),
			type: "progression",
			resourceId: "progression-1",
		});
	});

	it("should parse tnm category observation with stage group coding", () => {
		const observation: Observation = {
			resourceType: "Observation",
			id: "tnm-1",
			status: "final",
			subject: { reference: "Patient/example" },
			effectiveDateTime: "2023-05-15T11:30:00Z",
			code: {
				coding: [
					{
						system: "http://loinc.org",
						code: "21908-9",
						display: "Stage group",
					},
				],
			},
			hasMember: [
				{
					reference: "Observation/t-category",
				},
				{
					reference: "Observation/n-category",
				},
				{
					reference: "Observation/m-category",
				},
			],
		};

		const bundle: Bundle = {
			resourceType: "Bundle",
			type: "collection",
			entry: [{ resource: observation }],
		};

		const result = parseFHIRBundle(bundle);
		expect(result).toHaveLength(1);
		expect(result[0]).toEqual({
			startDate: new Date("2023-05-15T11:30:00Z"),
			type: "tnm",
			resourceId: "tnm-1",
		});
	});

	it("should handle resources without matching profiles", () => {
		const condition: Condition = {
			resourceType: "Condition",
			id: "other-condition",
			meta: {
				profile: ["https://example.com/other-profile"],
			},
			subject: { reference: "Patient/example" },
			recordedDate: "2023-01-15T10:30:00Z",
		};

		const bundle: Bundle = {
			resourceType: "Bundle",
			type: "collection",
			entry: [{ resource: condition }],
		};

		const result = parseFHIRBundle(bundle);
		expect(result).toHaveLength(0);
	});

	it("should handle resources without meta or profile", () => {
		const condition: Condition = {
			resourceType: "Condition",
			id: "no-meta-condition",
			subject: { reference: "Patient/example" },
			recordedDate: "2023-01-15T10:30:00Z",
		};

		const bundle: Bundle = {
			resourceType: "Bundle",
			type: "collection",
			entry: [{ resource: condition }],
		};

		const result = parseFHIRBundle(bundle);
		expect(result).toHaveLength(0);
	});

	it("should skip if no start date is provided", () => {
		const condition: Condition = {
			resourceType: "Condition",
			id: "no-date-condition",
			meta: {
				profile: [
					"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-diagnose",
				],
			},
			subject: { reference: "Patient/example" },
		};

		const bundle: Bundle = {
			resourceType: "Bundle",
			type: "collection",
			entry: [{ resource: condition }],
		};

		const result = parseFHIRBundle(bundle);
		expect(result).toHaveLength(0);
	});

	it("should sort events by start date", () => {
		const condition: Condition = {
			resourceType: "Condition",
			id: "diagnosis-1",
			meta: {
				profile: [
					"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-diagnose",
				],
			},
			subject: { reference: "Patient/example" },
			recordedDate: "2023-03-15T10:30:00Z",
		};

		const procedure: Procedure = {
			resourceType: "Procedure",
			id: "surgery-1",
			meta: {
				profile: [
					"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-operation",
				],
			},
			status: "completed",
			subject: { reference: "Patient/example" },
			performedDateTime: "2023-01-20T14:00:00Z",
		};

		const observation: Observation = {
			resourceType: "Observation",
			id: "progression-1",
			meta: {
				profile: [
					"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-verlauf",
				],
			},
			status: "final",
			subject: { reference: "Patient/example" },
			effectiveDateTime: "2023-02-15T11:30:00Z",
			code: {
				coding: [
					{
						system: "http://snomed.info/sct",
						code: "246901002",
						display: "Progression",
					},
				],
			},
		};

		const bundle: Bundle = {
			resourceType: "Bundle",
			type: "collection",
			entry: [{ resource: condition }, { resource: procedure }, { resource: observation }],
		};

		const result = parseFHIRBundle(bundle);
		expect(result).toHaveLength(3);
		expect(result[0].type).toBe("surgery");
		expect(result[1].type).toBe("progression");
		expect(result[2].type).toBe("diagnosis");
	});

	it("should handle entries without resources", () => {
		const bundle: Bundle = {
			resourceType: "Bundle",
			type: "collection",
			entry: [{}, { resource: undefined }],
		};

		const result = parseFHIRBundle(bundle);
		expect(result).toHaveLength(0);
	});

	it("should handle mixed valid and invalid resources", () => {
		const validCondition: Condition = {
			resourceType: "Condition",
			id: "valid-diagnosis",
			meta: {
				profile: [
					"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-diagnose",
				],
			},
			subject: { reference: "Patient/example" },
			recordedDate: "2023-01-15T10:30:00Z",
		};

		const invalidCondition: Condition = {
			resourceType: "Condition",
			id: "invalid-diagnosis",
			meta: {
				profile: ["https://example.com/other-profile"],
			},
			subject: { reference: "Patient/example" },
			recordedDate: "2023-01-15T10:30:00Z",
		};

		const bundle: Bundle = {
			resourceType: "Bundle",
			type: "collection",
			entry: [{ resource: validCondition }, { resource: invalidCondition }, {}],
		};

		const result = parseFHIRBundle(bundle);
		expect(result).toHaveLength(1);
		expect(result[0].type).toBe("diagnosis");
	});

	it("should handle InKaPP_Brust_C50 example bundle", () => {
		const bundlePath = path.resolve(__dirname, "./test-bundles/InKaPP_Brust_C50.json");
		if (!fs.existsSync(bundlePath)) {
			// skip test if bundle file does not exist
			return;
		}
		const bundle: Bundle = JSON.parse(fs.readFileSync(bundlePath, "utf-8"));
		const result = parseFHIRBundle(bundle);
		expect(result).toHaveLength(5);
		expect(result[0].type).toBe("diagnosis");
		expect(result[1].type).toBe("tnm");
		expect(result[2].type).toBe("surgery");
		expect(result[3].type).toBe("radiation");
		expect(result[4].type).toBe("progression");
	});

	it("should handle InKaPP_Darm_C18 example bundle", () => {
		const bundlePath = path.resolve(__dirname, "./test-bundles/InKaPP_Darm_C18.json");
		if (!fs.existsSync(bundlePath)) {
			// skip test if bundle file does not exist
			return;
		}
		const bundle: Bundle = JSON.parse(fs.readFileSync(bundlePath, "utf-8"));
		const result = parseFHIRBundle(bundle);
		expect(result).toHaveLength(33);
		expect(result[0].type).toBe("diagnosis");
		expect(result[1].type).toBe("tnm");
		expect(result[2].type).toBe("surgery");
		expect(result[3].type).toBe("tnm");
		expect(result[4].type).toBe("tnm");
		expect(result[5].type).toBe("systemicTherapy");
		expect(result[6].type).toBe("systemicTherapy");
		expect(result[7].type).toBe("systemicTherapy");
		expect(result[8].type).toBe("progression");
		expect(result[9].type).toBe("progression");
		expect(result[10].type).toBe("systemicTherapy");
		expect(result[11].type).toBe("systemicTherapy");
		expect(result[12].type).toBe("systemicTherapy");
		expect(result[13].type).toBe("systemicTherapy");
		expect(result[14].type).toBe("systemicTherapy");
		expect(result[15].type).toBe("systemicTherapy");
		expect(result[16].type).toBe("systemicTherapy");
		expect(result[17].type).toBe("systemicTherapy");
		expect(result[18].type).toBe("progression");
		expect(result[19].type).toBe("systemicTherapy");
		expect(result[20].type).toBe("systemicTherapy");
		expect(result[21].type).toBe("systemicTherapy");
		expect(result[22].type).toBe("progression");
		expect(result[23].type).toBe("systemicTherapy");
		expect(result[24].type).toBe("progression");
		expect(result[25].type).toBe("progression");
		expect(result[26].type).toBe("progression");
		expect(result[27].type).toBe("radiation");
		expect(result[28].type).toBe("radiation");
		expect(result[29].type).toBe("radiation");
		expect(result[30].type).toBe("systemicTherapy");
		expect(result[31].type).toBe("progression");
		expect(result[32].type).toBe("radiation");
	});

	it("should handle InKaPP_Lunge_C34 example bundle", () => {
		const bundlePath = path.resolve(__dirname, "./test-bundles/InKaPP_Lunge_C34.json");
		if (!fs.existsSync(bundlePath)) {
			// skip test if bundle file does not exist
			return;
		}
		const bundle: Bundle = JSON.parse(fs.readFileSync(bundlePath, "utf-8"));
		const result = parseFHIRBundle(bundle);
		expect(result).toHaveLength(6);
		expect(result[0].type).toBe("diagnosis");
		expect(result[1].type).toBe("surgery");
		expect(result[2].type).toBe("tnm");
		expect(result[3].type).toBe("radiation");
		expect(result[4].type).toBe("systemicTherapy");
		expect(result[5].type).toBe("progression");
	});

	it("should handle InKaPP_Prostata_C61 example bundle", () => {
		const bundlePath = path.resolve(__dirname, "./test-bundles/InKaPP_Prostata_C61.json");
		if (!fs.existsSync(bundlePath)) {
			// skip test if bundle file does not exist
			return;
		}
		const bundle: Bundle = JSON.parse(fs.readFileSync(bundlePath, "utf-8"));
		const result = parseFHIRBundle(bundle);
		expect(result).toHaveLength(7);
		expect(result[0].type).toBe("diagnosis");
		expect(result[1].type).toBe("surgery");
		expect(result[2].type).toBe("tnm");
		expect(result[3].type).toBe("tnm");
		expect(result[4].type).toBe("radiation");
		expect(result[5].type).toBe("systemicTherapy");
		expect(result[6].type).toBe("progression");
	});
});
