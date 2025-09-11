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
		isItemEnabled: (linkId: string) => boolean;
		globalError?: string;
	}

	let { item, answer, onAnswer, isItemEnabled, globalError }: Props = $props();

	let QuestionTypeComponent = $derived(getQuestionComponent(item.type));

	let error = $state<string | undefined>();
	let enabled = $derived(isItemEnabled(item.linkId));
	let displayError = $derived(globalError || error);

	function handleAnswer(value: any) {
		// Don't allow answers for disabled items
		if (!enabled) {
			return;
		}

		const validationResult = validateQuestionnaireItem(item, value, enabled);
		error = validationResult.message;

		if (validationResult.isValid) {
			onAnswer(value);
		}
	}
</script>

<div
	class={[
		"space-y-2",
		item.type !== "display" ? "bg-card rounded-lg border p-4" : undefined,
		displayError ? "border-destructive bg-destructive-foreground" : undefined,
		!enabled ? "pointer-events-none opacity-50" : undefined,
	]}
>
	<p class={["block", displayError ? "text-destructive" : undefined]}>
		{#if item.prefix}
			<span class="mr-1">{item.prefix}</span>
		{/if}
		{item.text}
		{#if item.required}
			<span class="text-destructive ml-1">*</span>
		{/if}
	</p>

	{#if item.type !== "display"}
		<div class="mt-2" data-testid="questionnaire-component">
			<QuestionTypeComponent
				{item}
				value={answer?.value}
				onAnswer={handleAnswer}
				disabled={!enabled}
			/>
		</div>
	{/if}

	{#if displayError}
		<p class="text-destructive mt-2 text-sm">{displayError}</p>
	{/if}
</div>
