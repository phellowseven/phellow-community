import type { QuestionnaireItem } from 'fhir/r4';

export interface ValidationResult {
	isValid: boolean;
	errors: Record<string, string>;
}

export function validateQuestionnaireItem(item: QuestionnaireItem, value: any): ValidationResult {
	const errors: Record<string, string> = {};

	// Check if item is required and empty
	if (item.required && isEmptyValue(value)) {
		errors[item.linkId] = 'This field is required';
	}

	return {
		isValid: Object.keys(errors).length === 0,
		errors
	};
}

export function validatePage(
	items: QuestionnaireItem[],
	formData: Record<string, any>
): ValidationResult {
	const errors: Record<string, string> = {};
	let isValid = true;

	function validateItem(item: QuestionnaireItem) {
		// Skip validation for display items
		if (item.type === 'display') return;

		// Skip validation for disabled items
		if (item.enableWhen && !isItemEnabled(item, formData)) return;

		// Validate the current item if it's required
		if (item.required && isEmptyValue(formData[item.linkId])) {
			errors[item.linkId] = 'This field is required';
			isValid = false;
		}

		// Recursively validate nested items
		if (item.item) {
			item.item.forEach(validateItem);
		}
	}

	items.forEach(validateItem);

	return { isValid, errors };
}

function isEmptyValue(value: any): boolean {
	if (value === undefined || value === null) return true;
	if (typeof value === 'string') return value.trim() === '';
	if (typeof value === 'object') {
		// For quantity type
		if ('value' in value) return value.value === undefined || value.value === null;
		// For empty objects
		return Object.keys(value).length === 0;
	}
	return false;
}

function isItemEnabled(item: QuestionnaireItem, formData: Record<string, any>): boolean {
	if (!item.enableWhen || item.enableWhen.length === 0) return true;

	return item.enableWhen.every((condition) => {
		const dependentValue = formData[condition.question];

		if (condition.answerString !== undefined) {
			return condition.operator === '='
				? dependentValue === condition.answerString
				: dependentValue !== condition.answerString;
		}

		// Add more condition types as needed
		return false;
	});
}
