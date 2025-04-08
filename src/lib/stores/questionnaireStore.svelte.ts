import { validateQuestionnaireItem } from "$lib/fhir/questionnaire/validation";
import type { Questionnaire, QuestionnaireItem } from "fhir/r4";
import { SvelteMap, SvelteSet } from "svelte/reactivity";

export interface QuestionnaireAnswer {
	linkId: string;
	value: any;
}

export interface FlattenedGroup {
	parentItem: QuestionnaireItem;
	children: QuestionnaireItem[];
}

export interface QuestionnaireState {
	currentIndex: number;
	answers: SvelteMap<string, QuestionnaireAnswer>;
	flattenedGroups: FlattenedGroup[];
	visibleItems: SvelteSet<string>;
	errors: SvelteMap<string, string | undefined>;
}

export function createQuestionnaireState(questionnaire: Questionnaire) {
	const state = $state<QuestionnaireState>({
		currentIndex: 0,
		answers: new SvelteMap(),
		flattenedGroups: flattenQuestionnaire(questionnaire),
		visibleItems: new SvelteSet(),
		errors: new SvelteMap(),
	});

	// Get all items in the questionnaire (flattened)
	function getAllItems(): QuestionnaireItem[] {
		const items: QuestionnaireItem[] = [];
		state.flattenedGroups.forEach((group) => {
			items.push(group.parentItem);
			items.push(...group.children);
		});
		return items;
	}

	function validateCurrentGroup(): boolean {
		const currentGroup = state.flattenedGroups[state.currentIndex];
		if (!currentGroup) return true;

		const itemsToValidate = [currentGroup.parentItem, ...currentGroup.children];

		let isValid = true;
		state.errors.clear();

		for (const item of itemsToValidate) {
			const answer = state.answers.get(item.linkId)?.value;
			const validationResult = validateQuestionnaireItem(item, answer);

			if (!validationResult.isValid) {
				state.errors.set(item.linkId, validationResult.message);
				isValid = false;
			}
		}

		return isValid;
	}

	function validateAllItems(): boolean {
		const allItems = getAllItems();
		let isValid = true;
		state.errors.clear();

		for (const item of allItems) {
			// Skip non-required display items
			if (item.type === "display" || !item.required) continue;

			const answer = state.answers.get(item.linkId)?.value;
			const validationResult = validateQuestionnaireItem(item, answer);

			if (!validationResult.isValid) {
				state.errors.set(item.linkId, validationResult.message);
				isValid = false;
			}
		}

		return isValid;
	}

	return {
		get currentIndex() {
			return state.currentIndex;
		},
		get answers() {
			return state.answers;
		},
		get visibleItems() {
			return state.visibleItems;
		},
		get flattenedGroups() {
			return state.flattenedGroups;
		},
		get currentGroup() {
			return state.flattenedGroups[state.currentIndex];
		},
		get errors() {
			return state.errors;
		},
		setAnswer(linkId: string, value: any) {
			if (value === null || value === undefined) {
				state.answers.delete(linkId);
			} else {
				state.answers.set(linkId, { linkId, value });
			}
			state.errors.delete(linkId); // Clear error when answer is updated
			this.evaluateVisibility();
		},
		evaluateVisibility() {
			// We'll implement this later
		},
		nextQuestion() {
			if (state.currentIndex < state.flattenedGroups.length - 1) {
				if (validateCurrentGroup()) {
					state.currentIndex++;
				}
			}
		},
		previousQuestion() {
			if (state.currentIndex > 0) {
				state.currentIndex--;
			}
		},
		validateAllItems,
		validateCurrentGroup,
	};
}

function flattenQuestionnaire(questionnaire: Questionnaire): FlattenedGroup[] {
	const groups: FlattenedGroup[] = [];

	// Helper function to flatten items below the second level
	function flattenSubItems(item: QuestionnaireItem): QuestionnaireItem[] {
		const flattened: QuestionnaireItem[] = [];

		function traverse(subItem: QuestionnaireItem) {
			flattened.push(subItem);
			subItem.item?.forEach(traverse);
		}

		item.item?.forEach(traverse);
		return flattened;
	}

	// Process top-level items
	questionnaire.item?.forEach((topLevelItem) => {
		if (topLevelItem.item?.length) {
			// If it has child items, keep them together as a group
			groups.push({
				parentItem: topLevelItem,
				children: topLevelItem.item,
			});

			// Now process any nested items beyond the second level
			topLevelItem.item.forEach((secondLevelItem) => {
				if (secondLevelItem.item?.length) {
					const flattenedSubItems = flattenSubItems(secondLevelItem);
					// Remove the original items to avoid duplication
					secondLevelItem.item = [];
					// Create a new group for each flattened subitem
					flattenedSubItems.forEach((subItem) => {
						groups.push({
							parentItem: secondLevelItem,
							children: [subItem],
						});
					});
				}
			});
		} else {
			// If it's a single item with no children, create a group with just that item
			groups.push({
				parentItem: topLevelItem,
				children: [],
			});
		}
	});

	return groups;
}
