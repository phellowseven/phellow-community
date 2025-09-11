import { evaluateEnableWhen } from "$lib/fhir/questionnaire/enableWhen";
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
	enabledItems: SvelteSet<string>;
	errors: SvelteMap<string, string | undefined>;
	allItems: QuestionnaireItem[];
}

export function createQuestionnaireState(questionnaire: Questionnaire) {
	const flattenedGroups = flattenQuestionnaire(questionnaire);
	const allItems = getAllItemsFromGroups(flattenedGroups);

	const state = $state<QuestionnaireState>({
		currentIndex: 0,
		answers: new SvelteMap(),
		flattenedGroups,
		visibleItems: new SvelteSet(),
		enabledItems: new SvelteSet(),
		errors: new SvelteMap(),
		allItems,
	});

	// Initialize enabled items based on initial enableWhen conditions
	initializeEnabledItems();

	// Initialize enabled items on first load
	function initializeEnabledItems() {
		state.allItems.forEach((item) => {
			if (evaluateEnableWhen(item, state.answers)) {
				state.enabledItems.add(item.linkId);
			}
		});

		// For child items, also check if their parent group is enabled
		state.flattenedGroups.forEach((group) => {
			const parentEnabled = state.enabledItems.has(group.parentItem.linkId);
			group.children.forEach((child) => {
				// Child is only enabled if both its own enableWhen AND parent's enableWhen are satisfied
				const childOwnCondition = evaluateEnableWhen(child, state.answers);
				if (!parentEnabled || !childOwnCondition) {
					state.enabledItems.delete(child.linkId);
				}
			});
		});
	}

	// Re-evaluate all enableWhen conditions when answers change
	function updateEnabledItems() {
		state.enabledItems.clear();
		
		// Build a map of parent-child relationships
		const parentChildMap = new Map<string, string[]>();
		state.flattenedGroups.forEach((group) => {
			const childIds = group.children.map(child => child.linkId);
			parentChildMap.set(group.parentItem.linkId, childIds);
		});

		state.allItems.forEach((item) => {
			if (evaluateEnableWhen(item, state.answers)) {
				state.enabledItems.add(item.linkId);
			}
		});

		// For child items, also check if their parent group is enabled
		state.flattenedGroups.forEach((group) => {
			const parentEnabled = state.enabledItems.has(group.parentItem.linkId);
			group.children.forEach((child) => {
				// Child is only enabled if both its own enableWhen AND parent's enableWhen are satisfied
				const childOwnCondition = evaluateEnableWhen(child, state.answers);
				if (!parentEnabled || !childOwnCondition) {
					state.enabledItems.delete(child.linkId);
				}
			});
		});

		// Adjust current index if current page is no longer valid
		adjustCurrentIndex();
	}

	// Ensure current index points to a valid enabled group
	function adjustCurrentIndex() {
		const enabledGroups = getEnabledGroups();

		// If no enabled groups, stay at 0
		if (enabledGroups.length === 0) {
			state.currentIndex = 0;
			return;
		}

		// If current index is beyond enabled groups, go to last enabled group
		if (state.currentIndex >= enabledGroups.length) {
			state.currentIndex = Math.max(0, enabledGroups.length - 1);
		}

		// If current group is not the same as the enabled group at this index,
		// it means the page structure changed, find the best match
		const currentEnabledGroup = enabledGroups[state.currentIndex];
		const originalCurrentGroup = state.flattenedGroups[state.currentIndex];

		if (
			currentEnabledGroup &&
			originalCurrentGroup &&
			currentEnabledGroup.parentItem.linkId !== originalCurrentGroup.parentItem.linkId
		) {
			// Find the index of the current group in the enabled groups
			const newIndex = enabledGroups.findIndex(
				(group) => group.parentItem.linkId === originalCurrentGroup.parentItem.linkId
			);
			if (newIndex >= 0) {
				state.currentIndex = newIndex;
			}
		}
	}

	// Get all items in the questionnaire (flattened)
	function getAllItems(): QuestionnaireItem[] {
		return state.allItems;
	}

	function validateCurrentGroup(): boolean {
		const currentGroup = state.flattenedGroups[state.currentIndex];
		if (!currentGroup) return true;

		const itemsToValidate = [currentGroup.parentItem, ...currentGroup.children];

		let isValid = true;
		state.errors.clear();

		for (const item of itemsToValidate) {
			const answer = state.answers.get(item.linkId)?.value;
			const isEnabled = state.enabledItems.has(item.linkId);
			const validationResult = validateQuestionnaireItem(item, answer, isEnabled);

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
			// Skip display items
			if (item.type === "display") continue;

			const answer = state.answers.get(item.linkId)?.value;
			const isEnabled = state.enabledItems.has(item.linkId);
			const validationResult = validateQuestionnaireItem(item, answer, isEnabled);

			if (!validationResult.isValid) {
				state.errors.set(item.linkId, validationResult.message);
				isValid = false;
			}
		}

		return isValid;
	}

	// Filter flattened groups to only include groups with enabled items
	function getEnabledGroups(): FlattenedGroup[] {
		return state.flattenedGroups.filter((group) => {
			// Check if parent item is enabled (for groups with no children)
			if (group.children.length === 0) {
				return state.enabledItems.has(group.parentItem.linkId);
			}

			// For groups with children, check if parent group is enabled AND any child items are enabled
			const parentEnabled = state.enabledItems.has(group.parentItem.linkId);
			const anyChildEnabled = group.children.some((child) => state.enabledItems.has(child.linkId));
			return parentEnabled && anyChildEnabled;
		});
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
		get enabledItems() {
			return state.enabledItems;
		},
		get flattenedGroups() {
			return state.flattenedGroups;
		},
		get enabledGroups() {
			return getEnabledGroups();
		},
		get currentGroup() {
			const enabledGroups = getEnabledGroups();
			return enabledGroups[state.currentIndex];
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
			updateEnabledItems(); // Re-evaluate enableWhen conditions
		},
		isItemEnabled(linkId: string): boolean {
			return state.enabledItems.has(linkId);
		},
		nextQuestion() {
			if (state.currentIndex < getEnabledGroups().length - 1) {
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
		getTotalSteps() {
			return getEnabledGroups().length;
		},
		getItemByLinkId(linkId: string): QuestionnaireItem | undefined {
			return state.allItems.find(item => item.linkId === linkId);
		},
		validateAllItems,
		validateCurrentGroup,
	};
}

function getAllItemsFromGroups(groups: FlattenedGroup[]): QuestionnaireItem[] {
	const items: QuestionnaireItem[] = [];
	groups.forEach((group) => {
		items.push(group.parentItem);
		items.push(...group.children);
	});
	return items;
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
