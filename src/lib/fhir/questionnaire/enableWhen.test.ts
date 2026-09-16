import type { QuestionnaireAnswer } from "$lib/stores/questionnaireStore.svelte";
import type { QuestionnaireItem } from "fhir/r4";
import { SvelteMap } from "svelte/reactivity";
import { describe, expect, test } from "vitest";
import { evaluateEnableWhen } from "./enableWhen";

describe("evaluateEnableWhen", () => {
	test("returns true for items without enableWhen conditions", () => {
		const item: QuestionnaireItem = {
			linkId: "test",
			type: "string",
			text: "Test question",
		};

		const answers = new SvelteMap<string, QuestionnaireAnswer>();

		const result = evaluateEnableWhen(item, answers);
		expect(result).toBe(true);
	});

	test("evaluates exists operator correctly", () => {
		const item: QuestionnaireItem = {
			linkId: "dependent",
			type: "string",
			text: "Dependent question",
			enableWhen: [
				{
					question: "trigger",
					operator: "exists",
					answerBoolean: true,
				},
			],
		};

		const answers = new SvelteMap<string, QuestionnaireAnswer>();

		// Should be false when no answer exists
		expect(evaluateEnableWhen(item, answers)).toBe(false);

		// Should be true when answer exists
		answers.set("trigger", { linkId: "trigger", value: "some value" });
		expect(evaluateEnableWhen(item, answers)).toBe(true);

		// Test answerBoolean: false
		const itemNotExists: QuestionnaireItem = {
			...item,
			enableWhen: [
				{
					question: "trigger",
					operator: "exists",
					answerBoolean: false,
				},
			],
		};

		answers.clear();
		expect(evaluateEnableWhen(itemNotExists, answers)).toBe(true);

		answers.set("trigger", { linkId: "trigger", value: "some value" });
		expect(evaluateEnableWhen(itemNotExists, answers)).toBe(false);
	});

	test("evaluates equality operator correctly", () => {
		const item: QuestionnaireItem = {
			linkId: "dependent",
			type: "string",
			text: "Dependent question",
			enableWhen: [
				{
					question: "trigger",
					operator: "=",
					answerString: "yes",
				},
			],
		};

		const answers = new SvelteMap<string, QuestionnaireAnswer>();

		// Should be false when no answer
		expect(evaluateEnableWhen(item, answers)).toBe(false);

		// Should be false when answer doesn't match
		answers.set("trigger", { linkId: "trigger", value: "no" });
		expect(evaluateEnableWhen(item, answers)).toBe(false);

		// Should be true when answer matches
		answers.set("trigger", { linkId: "trigger", value: "yes" });
		expect(evaluateEnableWhen(item, answers)).toBe(true);
	});

	test("evaluates boolean answers correctly", () => {
		const item: QuestionnaireItem = {
			linkId: "dependent",
			type: "string",
			text: "Dependent question",
			enableWhen: [
				{
					question: "trigger",
					operator: "=",
					answerBoolean: true,
				},
			],
		};

		const answers = new SvelteMap<string, QuestionnaireAnswer>();

		answers.set("trigger", { linkId: "trigger", value: true });
		expect(evaluateEnableWhen(item, answers)).toBe(true);

		answers.set("trigger", { linkId: "trigger", value: false });
		expect(evaluateEnableWhen(item, answers)).toBe(false);
	});

	test("evaluates coding answers correctly", () => {
		const item: QuestionnaireItem = {
			linkId: "dependent",
			type: "string",
			text: "Dependent question",
			enableWhen: [
				{
					question: "trigger",
					operator: "=",
					answerCoding: {
						system: "http://example.com",
						code: "yes",
						display: "Yes",
					},
				},
			],
		};

		const answers = new SvelteMap<string, QuestionnaireAnswer>();

		// Should be true for matching coding
		answers.set("trigger", {
			linkId: "trigger",
			value: { system: "http://example.com", code: "yes", display: "Yes" },
		});
		expect(evaluateEnableWhen(item, answers)).toBe(true);

		// Should be false for different code
		answers.set("trigger", {
			linkId: "trigger",
			value: { system: "http://example.com", code: "no", display: "No" },
		});
		expect(evaluateEnableWhen(item, answers)).toBe(false);

		// Should be true for string value matching code
		answers.set("trigger", { linkId: "trigger", value: "yes" });
		expect(evaluateEnableWhen(item, answers)).toBe(true);
	});

	test("evaluates enableBehavior all correctly", () => {
		const item: QuestionnaireItem = {
			linkId: "dependent",
			type: "string",
			text: "Dependent question",
			enableBehavior: "all",
			enableWhen: [
				{
					question: "trigger1",
					operator: "=",
					answerString: "yes",
				},
				{
					question: "trigger2",
					operator: "=",
					answerBoolean: true,
				},
			],
		};

		const answers = new SvelteMap<string, QuestionnaireAnswer>();

		// Should be false when no answers
		expect(evaluateEnableWhen(item, answers)).toBe(false);

		// Should be false when only one condition is met
		answers.set("trigger1", { linkId: "trigger1", value: "yes" });
		expect(evaluateEnableWhen(item, answers)).toBe(false);

		// Should be true when both conditions are met
		answers.set("trigger2", { linkId: "trigger2", value: true });
		expect(evaluateEnableWhen(item, answers)).toBe(true);
	});

	test("evaluates enableBehavior any correctly (default)", () => {
		const item: QuestionnaireItem = {
			linkId: "dependent",
			type: "string",
			text: "Dependent question",
			enableWhen: [
				{
					question: "trigger1",
					operator: "=",
					answerString: "yes",
				},
				{
					question: "trigger2",
					operator: "=",
					answerBoolean: true,
				},
			],
		};

		const answers = new SvelteMap<string, QuestionnaireAnswer>();

		// Should be false when no answers
		expect(evaluateEnableWhen(item, answers)).toBe(false);

		// Should be true when first condition is met
		answers.set("trigger1", { linkId: "trigger1", value: "yes" });
		expect(evaluateEnableWhen(item, answers)).toBe(true);

		// Should be true when second condition is met (and first is not)
		answers.set("trigger1", { linkId: "trigger1", value: "no" });
		answers.set("trigger2", { linkId: "trigger2", value: true });
		expect(evaluateEnableWhen(item, answers)).toBe(true);
	});

	test("evaluates numeric comparisons correctly", () => {
		const item: QuestionnaireItem = {
			linkId: "dependent",
			type: "string",
			text: "Dependent question",
			enableWhen: [
				{
					question: "age",
					operator: ">=",
					answerInteger: 18,
				},
			],
		};

		const answers = new SvelteMap<string, QuestionnaireAnswer>();

		answers.set("age", { linkId: "age", value: 17 });
		expect(evaluateEnableWhen(item, answers)).toBe(false);

		answers.set("age", { linkId: "age", value: 18 });
		expect(evaluateEnableWhen(item, answers)).toBe(true);

		answers.set("age", { linkId: "age", value: 25 });
		expect(evaluateEnableWhen(item, answers)).toBe(true);
	});

	test("evaluates array values from multiple choice questions correctly", () => {
		const item: QuestionnaireItem = {
			linkId: "dependent",
			type: "choice",
			text: "Dependent question",
			enableWhen: [
				{
					question: "multipleChoice",
					operator: "=",
					answerCoding: { code: "missingDiagnosis" },
				},
			],
		};

		const answers = new SvelteMap<string, QuestionnaireAnswer>();

		// Should be false when no answer
		expect(evaluateEnableWhen(item, answers)).toBe(false);

		// Should be false when array doesn't contain the expected value
		answers.set("multipleChoice", {
			linkId: "multipleChoice",
			value: [
				{ code: "missingInformation", display: "Fehlende Angabe" },
				{ code: "incorrectInformation", display: "Fehlerhafte Angabe" },
			],
		});
		expect(evaluateEnableWhen(item, answers)).toBe(false);

		// Should be true when array contains the expected value
		answers.set("multipleChoice", {
			linkId: "multipleChoice",
			value: [
				{ code: "missingDiagnosis", display: "Fehlende Diagnose" },
				{ code: "missingInformation", display: "Fehlende Angabe" },
			],
		});
		expect(evaluateEnableWhen(item, answers)).toBe(true);

		// Should be true when array contains only the expected value
		answers.set("multipleChoice", {
			linkId: "multipleChoice",
			value: [{ code: "missingDiagnosis", display: "Fehlende Diagnose" }],
		});
		expect(evaluateEnableWhen(item, answers)).toBe(true);
	});
});
