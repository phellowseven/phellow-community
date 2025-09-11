// src/lib/components/questionnaire/items/QuestionComponentFactory.ts
import type { QuestionnaireItem } from "fhir/r4";

import BooleanQuestion from "./BooleanQuestion.svelte";
import ChoiceQuestion from "./ChoiceQuestion.svelte";
import DateQuestion from "./DateQuestion.svelte";
import DateTimeQuestion from "./DateTimeQuestion.svelte";
import DecimalQuestion from "./DecimalQuestion.svelte";
import IntegerQuestion from "./IntegerQuestion.svelte";
import OpenChoiceQuestion from "./OpenChoiceQuestion.svelte";
import QuantityQuestion from "./QuantityQuestion.svelte";
import TextQuestion from "./TextQuestion.svelte";
import TimeQuestion from "./TimeQuestion.svelte";
import Unsupported from "./Unsupported.svelte";

const componentMap: Record<QuestionnaireItem["type"], any> = {
	boolean: BooleanQuestion,
	choice: ChoiceQuestion,
	"open-choice": OpenChoiceQuestion,
	text: TextQuestion,
	string: TextQuestion,
	integer: IntegerQuestion,
	decimal: DecimalQuestion,
	date: DateQuestion,
	dateTime: DateTimeQuestion,
	time: TimeQuestion,
	url: TextQuestion,
	// Add other types as we implement them
	group: Unsupported,
	display: Unsupported,
	question: Unsupported,
	attachment: Unsupported,
	reference: Unsupported,
	quantity: QuantityQuestion,
} as const;

export function getQuestionComponent(type: QuestionnaireItem["type"]) {
	return componentMap[type] ?? Unsupported; // Default to Unsupported if type not found
}
