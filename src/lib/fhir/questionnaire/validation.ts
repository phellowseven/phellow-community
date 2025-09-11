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

export function validateQuantity(value: any): ValidationResult {
	if (!value || typeof value !== "object") {
		return { isValid: true }; // Empty is valid unless required
	}

	// Check if value property exists and is a valid number
	if (value.value === undefined || value.value === null || value.value === "") {
		return {
			isValid: false,
			message: "Please enter a valid numeric value",
		};
	}

	const numValue = Number(value.value);
	if (isNaN(numValue)) {
		return {
			isValid: false,
			message: "Please enter a valid numeric value",
		};
	}

	// Check if unit is provided (usually required for quantities)
	if (!value.unit && !value.code) {
		return {
			isValid: false,
			message: "Please select a unit",
		};
	}

	return { isValid: true };
}

export function validateQuestionnaireItem(item: QuestionnaireItem, value: any, isEnabled: boolean = true): ValidationResult {
	// Check required first, but only if the item is enabled
	if (item.required && isEnabled) {
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
		case "quantity":
			return validateQuantity(value);
		case "string":
		case "text":
			return { isValid: true };
		case "url":
			return validateURL(value);
		default:
			return { isValid: true };
	}
}
