import type { QuestionnaireItem } from "fhir/r4";

import * as m from "$lib/paraglide/messages";

export interface ValidationResult {
	isValid: boolean;
	message?: string;
}

export interface ValidationRule {
	validate: (value: any) => ValidationResult;
	message: string;
}

export function validateRequired(value: any): ValidationResult {
	const isValid = value !== null && value !== undefined && value !== "";
	return {
		isValid,
		message: isValid ? undefined : m.questionnaire_validation_required(),
	};
}

export function validateMaxLength(maxLength: number): ValidationRule {
	return {
		validate: (value: string) => ({
			isValid: !value || value.length <= maxLength,
			message: m.questionnaire_validation_max_characters({ max: maxLength }),
		}),
		message: m.questionnaire_validation_max_characters({ max: maxLength }),
	};
}

export function validateInteger(value: any): ValidationResult {
	if (value === null || value === "") {
		return { isValid: true };
	}

	const isValid = Number.isInteger(Number(value));
	return {
		isValid,
		message: isValid ? undefined : m.questionnaire_validation_integer(),
	};
}

export function validateDate(value: string): ValidationResult {
	if (!value) return { isValid: true };

	const date = new Date(value);
	const isValid = !isNaN(date.getTime());
	return {
		isValid,
		message: isValid ? undefined : m.questionnaire_validation_date(),
	};
}

export function validateURL(value: string): ValidationResult {
	if (!value) return { isValid: true };

	try {
		new URL(value);
		return { isValid: true };
	} catch (err) {
		return {
			isValid: false,
			message: m.questionnaire_validation_url(),
		};
	}
}

export function validateQuestionnaireItem(item: QuestionnaireItem, value: any): ValidationResult {
	// Check required first
	if (item.required) {
		const requiredResult = validateRequired(value);
		if (!requiredResult.isValid) {
			return requiredResult;
		}
	}

	// If value is empty and not required, it's valid
	if (value === null || value === undefined || value === "") {
		return { isValid: true };
	}

	if (item.maxLength) {
		const maxLengthResult = validateMaxLength(item.maxLength).validate(value);
		if (!maxLengthResult.isValid) {
			return maxLengthResult;
		}
	}

	// Type-specific validation
	switch (item.type) {
		case "integer":
			return validateInteger(value);
		case "date":
			return validateDate(value);
		case "string":
		case "text":
			return { isValid: true };
		case "url":
			return validateURL(value);
		default:
			return { isValid: true };
	}
}
