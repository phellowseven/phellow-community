import type { QuestionnaireItem } from "fhir/r4";

export interface ItemComponentInterface<T> {
	item: QuestionnaireItem;
	value: T | undefined;
	onAnswer: (value: T | undefined) => void;
}
