import type { QuestionnaireAnswer } from "$lib/stores/questionnaireStore.svelte";
import { CalendarDate, Time } from "@internationalized/date";
import type {
	Questionnaire,
	QuestionnaireResponse,
	QuestionnaireResponseItem,
	QuestionnaireResponseItemAnswer,
} from "fhir/r4";

/**
 * Creates a FHIR QuestionnaireResponse from the given questionnaire and answers
 */
export function createQuestionnaireResponse(
	questionnaire: Questionnaire,
	answers: Map<string, QuestionnaireAnswer>
): QuestionnaireResponse {
	const now = new Date().toISOString();

	// Create the base QuestionnaireResponse structure
	const response: QuestionnaireResponse = {
		resourceType: "QuestionnaireResponse",
		status: "completed",
		questionnaire: questionnaire.url ?? questionnaire.id ?? "",
		authored: now,
		item: mapAnswersToResponseItems(questionnaire.item ?? [], answers),
	};

	// Add metadata
	if (questionnaire.id) {
		response.questionnaire = questionnaire.id;
	}

	return response;
}

/**
 * Maps questionnaire items and their answers to QuestionnaireResponse items
 */
function mapAnswersToResponseItems(
	items: Questionnaire["item"],
	answers: Map<string, QuestionnaireAnswer>
): QuestionnaireResponse["item"] {
	if (!items) return [];

	return items
		.filter((item) => {
			// Include items that either have an answer or have child items
			return answers.has(item.linkId) || (item.item && item.item.length > 0);
		})
		.map((item) => {
			const answer = answers.get(item.linkId);

			const responseItem: QuestionnaireResponseItem = {
				linkId: item.linkId,
				text: item.text,
			};

			// Add answer if exists
			if (answer) {
				responseItem.answer = [mapValueToResponseAnswer(item.type, answer.value)];
			}

			// Add child items if they exist
			if (item.item && item.item.length > 0) {
				responseItem.item = mapAnswersToResponseItems(item.item, answers);
			}

			return responseItem;
		});
}

/**
 * Maps a value to the appropriate QuestionnaireResponse answer format
 * based on the item type
 */
function mapValueToResponseAnswer(
	type: string | undefined,
	value: any
): QuestionnaireResponseItemAnswer {
	if (value === undefined || value === null) {
		return {}; // Empty answer
	}

	switch (type) {
		case "boolean":
			return { valueBoolean: value };

		case "decimal":
			return { valueDecimal: value };

		case "integer":
			return { valueInteger: value };

		case "date":
			// Handle CalendarDate from @internationalized/date
			if (value instanceof CalendarDate) {
				return {
					valueDate: `${value.year}-${String(value.month).padStart(2, "0")}-${String(value.day).padStart(2, "0")}`,
				};
			}
			return { valueDate: value };

		case "dateTime":
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

				return { valueDateTime: dateTimeStr };
			}
			return { valueDateTime: value };

		case "time":
			// Handle Time from @internationalized/date
			if (value instanceof Time) {
				return {
					valueTime: `${String(value.hour).padStart(2, "0")}:${String(value.minute).padStart(2, "0")}:${String(value.second || 0).padStart(2, "0")}`,
				};
			}
			return { valueTime: value };

		case "string":
		case "text":
			return { valueString: value };

		case "url":
			return { valueUri: value };
		case "choice":
			// Handle choice selections
			return { valueCoding: { code: value, display: value } };

		case "open-choice":
			// Handle open choice selections which return { code, text }
			if (typeof value === "object" && value.code && value.text) {
				if (value.code.startsWith("phellow-community:customOpenChoice")) {
					return { valueString: value.text };
				}
				return { valueCoding: { code: value.code, display: value.text } };
			}
			return { valueString: value };

		default:
			// Default to string for unknown types
			return { valueString: String(value) };
	}
}
