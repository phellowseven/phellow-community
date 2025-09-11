import type { Questionnaire } from "fhir/r4";
import { describe, expect, test } from "vitest";
import { createQuestionnaireState } from "./questionnaireStore.svelte";

describe("questionnaireStore pagination with enableWhen", () => {
	test("filters out pages with disabled items", () => {
		const questionnaire: Questionnaire = {
			resourceType: "Questionnaire",
			status: "active",
			title: "Test Questionnaire",
			id: "test",
			item: [
				{
					linkId: "first_question",
					text: "First question",
					type: "choice",
					answerOption: [
						{ valueCoding: { code: "yes", display: "Yes" } },
						{ valueCoding: { code: "no", display: "No" } },
					],
				},
				{
					linkId: "conditional_question",
					text: "This question only shows when first is 'no'",
					type: "string",
					enableWhen: [
						{
							question: "first_question",
							operator: "=",
							answerCoding: { code: "no" },
						},
					],
				},
			],
		};

		const store = createQuestionnaireState(questionnaire);

		// Initially, only the first page should be enabled
		expect(store.enabledGroups.length).toBe(1);
		expect(store.getTotalSteps()).toBe(1);
		expect(store.currentGroup?.parentItem.linkId).toBe("first_question");

		// Answer "yes" to first question - conditional question should remain disabled
		store.setAnswer("first_question", { code: "yes", display: "Yes" });
		expect(store.enabledGroups.length).toBe(1);
		expect(store.getTotalSteps()).toBe(1);

		// Answer "no" to first question - conditional question should become enabled
		store.setAnswer("first_question", { code: "no", display: "No" });
		expect(store.enabledGroups.length).toBe(2);
		expect(store.getTotalSteps()).toBe(2);

		// Should be able to navigate to second page
		store.nextQuestion();
		expect(store.currentIndex).toBe(1);
		expect(store.currentGroup?.parentItem.linkId).toBe("conditional_question");

		// Change answer back to "yes" - should automatically adjust to valid page
		store.setAnswer("first_question", { code: "yes", display: "Yes" });
		expect(store.enabledGroups.length).toBe(1);
		expect(store.getTotalSteps()).toBe(1);
		// Current index should be adjusted back to 0 since page 1 no longer exists
		expect(store.currentIndex).toBe(0);
		expect(store.currentGroup?.parentItem.linkId).toBe("first_question");
	});

	test("handles diagnosis feedback questionnaire scenario", () => {
		const diagnosisFeedback: Questionnaire = {
			resourceType: "Questionnaire",
			status: "active",
			title: "Feedback zur Diagnose",
			id: "1_Fd",
			item: [
				{
					linkId: "0_Fd_Diag_ins",
					text: "Stimmen die Diagnosedaten?",
					type: "choice",
					answerOption: [
						{ valueCoding: { code: "yes", display: "Ja" } },
						{ valueCoding: { code: "no", display: "Nein" } },
						{ valueCoding: { code: "unknown", display: "Ich weiß nicht" } },
						{ valueCoding: { code: "na", display: "Keine Angabe" } },
					],
				},
				{
					linkId: "0_1_Fd_Diag_ins_nein",
					text: "Fehlt eine Krebsdiagnose? Fehlt eine Angabe der hier angezeigten Diagnose und/oder sind vorhandende Daten fehlerhaft?",
					type: "choice",
					repeats: true,
					enableWhen: [
						{
							question: "0_Fd_Diag_ins",
							operator: "=",
							answerCoding: { code: "no" },
						},
					],
					answerOption: [
						{ valueCoding: { code: "missingDiagnosis", display: "Fehlende Diagnose" } },
						{ valueCoding: { code: "missingInformation", display: "Fehlende Angabe" } },
						{ valueCoding: { code: "incorrectInformation", display: "Fehlerhafte Angabe" } },
						{ valueCoding: { code: "unknown", display: "Weiß nicht" } },
						{ valueCoding: { code: "na", display: "Keine Angabe" } },
					],
				},
			],
		};

		const store = createQuestionnaireState(diagnosisFeedback);

		// Initially, only first question should be visible
		expect(store.enabledGroups.length).toBe(1);
		expect(store.getTotalSteps()).toBe(1);
		expect(store.currentGroup?.parentItem.linkId).toBe("0_Fd_Diag_ins");

		// Answer "ja" - should still only have 1 page
		store.setAnswer("0_Fd_Diag_ins", { code: "yes", display: "Ja" });
		expect(store.enabledGroups.length).toBe(1);
		expect(store.getTotalSteps()).toBe(1);

		// Answer "nein" - should now have 2 pages
		store.setAnswer("0_Fd_Diag_ins", { code: "no", display: "Nein" });
		expect(store.enabledGroups.length).toBe(2);
		expect(store.getTotalSteps()).toBe(2);

		// Navigate to second page
		store.nextQuestion();
		expect(store.currentIndex).toBe(1);
		expect(store.currentGroup?.parentItem.linkId).toBe("0_1_Fd_Diag_ins_nein");

		// Change back to "ja" - should auto-navigate back to first page
		store.setAnswer("0_Fd_Diag_ins", { code: "yes", display: "Ja" });
		expect(store.enabledGroups.length).toBe(1);
		expect(store.getTotalSteps()).toBe(1);
		expect(store.currentIndex).toBe(0);
	});

	test("handles navigation bounds correctly with dynamic pages", () => {
		const questionnaire: Questionnaire = {
			resourceType: "Questionnaire",
			status: "active",
			title: "Multi-step Test",
			id: "test",
			item: [
				{
					linkId: "step1",
					text: "Step 1",
					type: "choice",
					answerOption: [
						{ valueCoding: { code: "continue", display: "Continue" } },
						{ valueCoding: { code: "skip", display: "Skip to end" } },
					],
				},
				{
					linkId: "step2",
					text: "Step 2 (conditional)",
					type: "string",
					enableWhen: [
						{
							question: "step1",
							operator: "=",
							answerCoding: { code: "continue" },
						},
					],
				},
				{
					linkId: "step3",
					text: "Step 3 (always shown)",
					type: "string",
				},
			],
		};

		const store = createQuestionnaireState(questionnaire);

		// Initially should have 2 pages (step1 and step3, step2 is disabled)
		expect(store.enabledGroups.length).toBe(2);
		expect(store.getTotalSteps()).toBe(2);

		// Answer "continue" - should now have 3 pages
		store.setAnswer("step1", { code: "continue", display: "Continue" });
		expect(store.enabledGroups.length).toBe(3);
		expect(store.getTotalSteps()).toBe(3);

		// Navigate to step 2
		store.nextQuestion();
		expect(store.currentIndex).toBe(1);
		expect(store.currentGroup?.parentItem.linkId).toBe("step2");

		// Navigate to step 3
		store.nextQuestion();
		expect(store.currentIndex).toBe(2);
		expect(store.currentGroup?.parentItem.linkId).toBe("step3");

		// Should not be able to go further
		store.nextQuestion();
		expect(store.currentIndex).toBe(2);

		// Change step1 to "skip" while on step 3
		store.setAnswer("step1", { code: "skip", display: "Skip to end" });
		expect(store.enabledGroups.length).toBe(2);
		expect(store.getTotalSteps()).toBe(2);
		// Should adjust current index to stay within bounds (step 3 is now at index 1)
		expect(store.currentIndex).toBe(1);
		expect(store.currentGroup?.parentItem.linkId).toBe("step3");
	});

	test("handles group enableWhen conditions correctly", () => {
		const questionnaire: Questionnaire = {
			resourceType: "Questionnaire",
			status: "active",
			title: "Group EnableWhen Test",
			id: "group_test",
			item: [
				{
					linkId: "0_1_Fd_Diag_ins_nein",
					text: "Multiple choice question",
					type: "choice",
					repeats: true,
					answerOption: [
						{ valueCoding: { code: "missingDiagnosis", display: "Fehlende Diagnose" } },
						{ valueCoding: { code: "missingInformation", display: "Fehlende Angabe" } },
						{ valueCoding: { code: "incorrectInformation", display: "Fehlerhafte Angabe" } },
					],
				},
				{
					linkId: "1_1_1_Fd_Diag_Entitaet_group",
					type: "group",
					enableWhen: [
						{
							question: "0_1_Fd_Diag_ins_nein",
							operator: "=",
							answerCoding: { code: "missingDiagnosis" },
						},
					],
					item: [
						{
							linkId: "1_1_1_Fd_Diag_Entitaet_f",
							text: "Wenn fehlend, dann Angabe der fehlenden Entität",
							type: "choice",
							required: true,
							answerOption: [
								{ valueCoding: { code: "catalog", display: "Katalog" } },
								{ valueCoding: { code: "other", display: "Sonstiges" } },
							],
						},
						{
							linkId: "1_1_1_1_Fd_Diag_Entitaet_f_u",
							text: "Fehlend, aber nicht bekannt",
							type: "boolean",
							required: true,
						},
					],
				},
			],
		};

		const store = createQuestionnaireState(questionnaire);

		// Initially, only first question should be enabled
		expect(store.enabledGroups.length).toBe(1);
		expect(store.getTotalSteps()).toBe(1);
		expect(store.currentGroup?.parentItem.linkId).toBe("0_1_Fd_Diag_ins_nein");
		expect(store.isItemEnabled("1_1_1_Fd_Diag_Entitaet_group")).toBe(false);
		expect(store.isItemEnabled("1_1_1_Fd_Diag_Entitaet_f")).toBe(false);

		// Select "missingInformation" - group should still be disabled
		store.setAnswer("0_1_Fd_Diag_ins_nein", [
			{ code: "missingInformation", display: "Fehlende Angabe" },
		]);
		expect(store.enabledGroups.length).toBe(1);
		expect(store.getTotalSteps()).toBe(1);
		expect(store.isItemEnabled("1_1_1_Fd_Diag_Entitaet_group")).toBe(false);

		// Select "missingDiagnosis" - group and its children should be enabled
		store.setAnswer("0_1_Fd_Diag_ins_nein", [
			{ code: "missingDiagnosis", display: "Fehlende Diagnose" },
		]);
		expect(store.enabledGroups.length).toBe(2);
		expect(store.getTotalSteps()).toBe(2);
		expect(store.isItemEnabled("1_1_1_Fd_Diag_Entitaet_group")).toBe(true);
		expect(store.isItemEnabled("1_1_1_Fd_Diag_Entitaet_f")).toBe(true);
		expect(store.isItemEnabled("1_1_1_1_Fd_Diag_Entitaet_f_u")).toBe(true);

		// Navigate to the group page
		store.nextQuestion();
		expect(store.currentIndex).toBe(1);
		expect(store.currentGroup?.parentItem.linkId).toBe("1_1_1_Fd_Diag_Entitaet_group");

		// Select both options - group should still be enabled
		store.setAnswer("0_1_Fd_Diag_ins_nein", [
			{ code: "missingDiagnosis", display: "Fehlende Diagnose" },
			{ code: "missingInformation", display: "Fehlende Angabe" },
		]);
		expect(store.enabledGroups.length).toBe(2);
		expect(store.getTotalSteps()).toBe(2);
		expect(store.isItemEnabled("1_1_1_Fd_Diag_Entitaet_group")).toBe(true);

		// Remove "missingDiagnosis" from selection - group should be disabled
		store.setAnswer("0_1_Fd_Diag_ins_nein", [
			{ code: "missingInformation", display: "Fehlende Angabe" },
		]);
		expect(store.enabledGroups.length).toBe(1);
		expect(store.getTotalSteps()).toBe(1);
		expect(store.isItemEnabled("1_1_1_Fd_Diag_Entitaet_group")).toBe(false);
		// Should auto-navigate back to first page
		expect(store.currentIndex).toBe(0);
	});

	test("getItemByLinkId returns correct item", () => {
		const questionnaire: Questionnaire = {
			resourceType: "Questionnaire",
			status: "active",
			title: "Test Questionnaire",
			id: "test",
			item: [
				{
					linkId: "question1",
					text: "First question",
					type: "string",
				},
				{
					linkId: "question2",
					text: "Second question",
					type: "boolean",
				},
			],
		};

		const store = createQuestionnaireState(questionnaire);

		// Test finding existing items
		const item1 = store.getItemByLinkId("question1");
		expect(item1).toBeDefined();
		expect(item1?.text).toBe("First question");
		expect(item1?.type).toBe("string");

		const item2 = store.getItemByLinkId("question2");
		expect(item2).toBeDefined();
		expect(item2?.text).toBe("Second question");
		expect(item2?.type).toBe("boolean");

		// Test non-existing item
		const nonExistent = store.getItemByLinkId("non-existent");
		expect(nonExistent).toBeUndefined();
	});
});
