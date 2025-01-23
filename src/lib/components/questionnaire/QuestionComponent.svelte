<!-- src/lib/components/questionnaire/QuestionComponent.svelte -->
<script lang="ts">
	import type { QuestionnaireAnswer } from "$lib/stores/questionnaireStore.svelte";
	import type { QuestionnaireItem } from "fhir/r4";
	import { getQuestionComponent } from "./items/QuestionnaireItemComponentFactory";
	import { validateQuestionnaireItem } from "$lib/fhir/questionnaire/validation";

	interface Props {
		item: QuestionnaireItem;
		answer?: QuestionnaireAnswer;
		onAnswer: (value: any) => void;
	}

	let { item, answer, onAnswer }: Props = $props();

	let QuestionTypeComponent = $derived(getQuestionComponent(item.type));

	let error = $state<string | undefined>();

	function handleAnswer(value: any) {
		const validationResult = validateQuestionnaireItem(item, value);
		error = validationResult.message;

		if (validationResult.isValid) {
			onAnswer(value);
		}
	}
</script>

<div
	class={[
		"space-y-2",
		item.type !== "display" ? "rounded-lg border bg-card p-4" : undefined,
		error ? "border-destructive-foreground bg-destructive" : undefined,
	]}
>
	<p class={["block", error ? "text-destructive-foreground" : undefined]}>
		{#if item.prefix}
			<span class="mr-1">{item.prefix}</span>
		{/if}
		{item.text}
		{#if item.required}
			<span class="ml-1 text-destructive-foreground">*</span>
		{/if}
	</p>

	{#if item.type !== "display"}
		<div class="mt-2">
			<QuestionTypeComponent {item} value={answer?.value} onAnswer={handleAnswer} />
		</div>
	{/if}

	{#if error}
		<p class="mt-2 text-sm text-destructive-foreground">{error}</p>
	{/if}
</div>
