import type { QuestionnaireAnswer } from "$lib/stores/questionnaireStore.svelte";
import type { Coding, QuestionnaireItem, QuestionnaireItemEnableWhen } from "fhir/r4";

/**
 * Evaluates enableWhen conditions for a questionnaire item
 * @param item The questionnaire item to evaluate
 * @param answers Map of current answers
 * @returns true if the item should be enabled/shown, false otherwise
 */
export function evaluateEnableWhen(
	item: QuestionnaireItem,
	answers: Map<string, QuestionnaireAnswer>
): boolean {
	// If no enableWhen conditions, item is always enabled
	if (!item.enableWhen || item.enableWhen.length === 0) {
		return true;
	}

	const enableWhenBehavior = item.enableBehavior || "any";
	const results = item.enableWhen.map((condition) => evaluateSingleCondition(condition, answers));

	// Apply enableBehavior logic
	if (enableWhenBehavior === "all") {
		return results.every((result) => result);
	} else {
		// Default "any" behavior
		return results.some((result) => result);
	}
}

/**
 * Evaluates a single enableWhen condition
 */
function evaluateSingleCondition(
	condition: QuestionnaireItemEnableWhen,
	answers: Map<string, QuestionnaireAnswer>
): boolean {
	const answer = answers.get(condition.question);
	const answerValue = answer?.value;

	// If no answer exists, treat as null/undefined
	if (!answer || answerValue === null || answerValue === undefined) {
		return evaluateNullAnswer(condition);
	}

	switch (condition.operator) {
		case "exists":
			return condition.answerBoolean === true
				? answerValue !== undefined
				: answerValue === undefined;

		case "=":
			return isEqual(answerValue, condition);

		case "!=":
			return !isEqual(answerValue, condition);

		case ">":
			return isGreaterThan(answerValue, condition);

		case "<":
			return isLessThan(answerValue, condition);

		case ">=":
			return isGreaterThanOrEqual(answerValue, condition);

		case "<=":
			return isLessThanOrEqual(answerValue, condition);

		default:
			console.warn(`Unsupported enableWhen operator: ${condition.operator}`);
			return false;
	}
}

/**
 * Handles evaluation when no answer exists
 */
function evaluateNullAnswer(condition: QuestionnaireItemEnableWhen): boolean {
	switch (condition.operator) {
		case "exists":
			return condition.answerBoolean === false;
		case "!=":
			return true; // null is not equal to any value
		default:
			return false; // null fails all other comparisons
	}
}

/**
 * Checks equality between answer value and condition
 */
function isEqual(answerValue: any, condition: QuestionnaireItemEnableWhen): boolean {
	// Handle array values (from multiple choice questions with repeats: true)
	if (Array.isArray(answerValue)) {
		return answerValue.some((value) => isEqual(value, condition));
	}

	// Handle different answer types
	if (condition.answerBoolean !== undefined) {
		return answerValue === condition.answerBoolean;
	}

	if (condition.answerDecimal !== undefined) {
		return Number(answerValue) === condition.answerDecimal;
	}

	if (condition.answerInteger !== undefined) {
		return Number(answerValue) === condition.answerInteger;
	}

	if (condition.answerDate !== undefined) {
		return normalizeDate(answerValue) === condition.answerDate;
	}

	if (condition.answerDateTime !== undefined) {
		return normalizeDateTime(answerValue) === condition.answerDateTime;
	}

	if (condition.answerTime !== undefined) {
		return normalizeTime(answerValue) === condition.answerTime;
	}

	if (condition.answerString !== undefined) {
		return String(answerValue) === condition.answerString;
	}

	if (condition.answerCoding !== undefined) {
		return isCodingEqual(answerValue, condition.answerCoding);
	}

	if (condition.answerQuantity !== undefined) {
		return isQuantityEqual(answerValue, condition.answerQuantity);
	}

	if (condition.answerReference !== undefined) {
		// TODO: Implement reference comparison if needed
		return false;
	}

	return false;
}

/**
 * Compares two Quantity objects for equality
 */
function isQuantityEqual(answerValue: any, expectedQuantity: any): boolean {
	if (!answerValue || typeof answerValue !== "object" || !answerValue.value) {
		return false;
	}

	// Compare numeric values
	if (Number(answerValue.value) !== Number(expectedQuantity.value)) {
		return false;
	}

	// Compare units - prefer code over unit string, but accept either
	const answerUnit = answerValue.code || answerValue.unit;
	const expectedUnit = expectedQuantity.code || expectedQuantity.unit;

	return answerUnit === expectedUnit;
}

/**
 * Checks if answer value is greater than condition value
 */
function isGreaterThan(answerValue: any, condition: QuestionnaireItemEnableWhen): boolean {
	if (condition.answerDecimal !== undefined) {
		return Number(answerValue) > condition.answerDecimal;
	}

	if (condition.answerInteger !== undefined) {
		return Number(answerValue) > condition.answerInteger;
	}

	if (condition.answerQuantity !== undefined) {
		return isQuantityGreaterThan(answerValue, condition.answerQuantity);
	}

	if (condition.answerDate !== undefined) {
		return normalizeDate(answerValue) > condition.answerDate;
	}

	if (condition.answerDateTime !== undefined) {
		return normalizeDateTime(answerValue) > condition.answerDateTime;
	}

	if (condition.answerTime !== undefined) {
		return normalizeTime(answerValue) > condition.answerTime;
	}

	return false;
}

/**
 * Checks if quantity answer is greater than condition quantity
 */
function isQuantityGreaterThan(answerValue: any, conditionQuantity: any): boolean {
	if (!answerValue || typeof answerValue !== "object" || !answerValue.value) {
		return false;
	}

	// For now, only compare quantities with the same unit
	const answerUnit = answerValue.code || answerValue.unit;
	const conditionUnit = conditionQuantity.code || conditionQuantity.unit;

	if (answerUnit !== conditionUnit) {
		// TODO: Unit conversion could be implemented here
		return false;
	}

	return Number(answerValue.value) > Number(conditionQuantity.value);
}

/**
 * Checks if quantity answer is less than condition quantity
 */
function isQuantityLessThan(answerValue: any, conditionQuantity: any): boolean {
	if (!answerValue || typeof answerValue !== "object" || !answerValue.value) {
		return false;
	}

	// For now, only compare quantities with the same unit
	const answerUnit = answerValue.code || answerValue.unit;
	const conditionUnit = conditionQuantity.code || conditionQuantity.unit;

	if (answerUnit !== conditionUnit) {
		// TODO: Unit conversion could be implemented here
		return false;
	}

	return Number(answerValue.value) < Number(conditionQuantity.value);
}

/**
 * Checks if answer value is less than condition value
 */
function isLessThan(answerValue: any, condition: QuestionnaireItemEnableWhen): boolean {
	if (condition.answerDecimal !== undefined) {
		return Number(answerValue) < condition.answerDecimal;
	}

	if (condition.answerInteger !== undefined) {
		return Number(answerValue) < condition.answerInteger;
	}

	if (condition.answerQuantity !== undefined) {
		return isQuantityLessThan(answerValue, condition.answerQuantity);
	}

	if (condition.answerDate !== undefined) {
		return normalizeDate(answerValue) < condition.answerDate;
	}

	if (condition.answerDateTime !== undefined) {
		return normalizeDateTime(answerValue) < condition.answerDateTime;
	}

	if (condition.answerTime !== undefined) {
		return normalizeTime(answerValue) < condition.answerTime;
	}

	return false;
}

/**
 * Checks if answer value is greater than or equal to condition value
 */
function isGreaterThanOrEqual(answerValue: any, condition: QuestionnaireItemEnableWhen): boolean {
	return isGreaterThan(answerValue, condition) || isEqual(answerValue, condition);
}

/**
 * Checks if answer value is less than or equal to condition value
 */
function isLessThanOrEqual(answerValue: any, condition: QuestionnaireItemEnableWhen): boolean {
	return isLessThan(answerValue, condition) || isEqual(answerValue, condition);
}

/**
 * Compares two Coding objects for equality
 */
function isCodingEqual(answerValue: any, expectedCoding: Coding): boolean {
	// Handle array values (from multiple choice questions with repeats: true)
	if (Array.isArray(answerValue)) {
		return answerValue.some((value) => isCodingEqual(value, expectedCoding));
	}

	if (typeof answerValue === "object" && answerValue.code !== undefined) {
		// Compare code and system if both are present
		if (expectedCoding.system && answerValue.system) {
			return (
				answerValue.code === expectedCoding.code && answerValue.system === expectedCoding.system
			);
		}
		// Otherwise just compare codes
		return answerValue.code === expectedCoding.code;
	}

	// Handle string values that might match the coding code
	if (typeof answerValue === "string") {
		return answerValue === expectedCoding.code;
	}

	return false;
}

/**
 * Normalizes date values for comparison
 */
function normalizeDate(value: any): string {
	if (typeof value === "string") {
		return value;
	}

	// Handle CalendarDate from @internationalized/date
	if (value && typeof value === "object" && "year" in value) {
		const month = String(value.month).padStart(2, "0");
		const day = String(value.day).padStart(2, "0");
		return `${value.year}-${month}-${day}`;
	}

	return String(value);
}

/**
 * Normalizes datetime values for comparison
 */
function normalizeDateTime(value: any): string {
	if (typeof value === "string") {
		return value;
	}

	// Handle DateValue from @internationalized/date
	if (value && typeof value === "object" && "year" in value) {
		const month = String(value.month).padStart(2, "0");
		const day = String(value.day).padStart(2, "0");
		let dateTimeStr = `${value.year}-${month}-${day}`;

		// Add time if available
		if ("hour" in value) {
			const hour = String(value.hour).padStart(2, "0");
			const minute = String(value.minute || 0).padStart(2, "0");
			const second = String(value.second || 0).padStart(2, "0");
			dateTimeStr += `T${hour}:${minute}:${second}`;
		}

		return dateTimeStr;
	}

	return String(value);
}

/**
 * Normalizes time values for comparison
 */
function normalizeTime(value: any): string {
	if (typeof value === "string") {
		return value;
	}

	// Handle Time from @internationalized/date
	if (value && typeof value === "object" && "hour" in value) {
		const hour = String(value.hour).padStart(2, "0");
		const minute = String(value.minute).padStart(2, "0");
		const second = String(value.second || 0).padStart(2, "0");
		return `${hour}:${minute}:${second}`;
	}

	return String(value);
}
