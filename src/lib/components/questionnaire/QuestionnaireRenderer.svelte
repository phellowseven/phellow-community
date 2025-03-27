<!-- src/lib/components/questionnaire/QuestionnaireRenderer.svelte -->
<script lang="ts">
	import type { Questionnaire, QuestionnaireResponse } from "fhir/r4";

	import * as m from "$lib/paraglide/messages";

	import { createQuestionnaireResponse } from "$lib/fhir/questionnaire/createQuestionnaireResponse";
	import { createQuestionnaireState } from "$lib/stores/questionnaireStore.svelte";

	import { Button } from "$components/ui/button";

	import CheckCircle from "lucide-svelte/icons/check-circle";

	import QuestionnaireNavigation from "./QuestionnaireNavigation.svelte";
	import QuestionGroup from "./QuestionGroup.svelte";
	import QuestionnaireProgress from "./QuestionnaireProgress.svelte";

	interface Props {
		questionnaire: Questionnaire;
		onSubmit?: (response: QuestionnaireResponse) => void;
	}

	let { questionnaire, onSubmit }: Props = $props();

	const questionnaireState = createQuestionnaireState(questionnaire);

	let currentGroup = $derived.by(() => {
		const currentItem = questionnaireState.currentGroup;
		return currentItem;
	});

	let isLastPage = $derived(
		questionnaireState.currentIndex === questionnaireState.flattenedGroups.length - 1
	);
	let isValid = $derived(questionnaireState.errors.size === 0);
	let submitting = $state(false);

	function handleNext() {
		questionnaireState.nextQuestion();
		if (questionnaireState.errors.size > 0) {
			// Scroll to first error
			const firstErrorElement = document.querySelector(".border-destructive-foreground");
			firstErrorElement?.scrollIntoView({ behavior: "smooth", block: "center" });
		}
	}

	function handleSubmit() {
		submitting = true;

		// Validate all items before submission
		const valid = questionnaireState.validateAllItems();
		if (!valid) {
			submitting = false;
			// Scroll to first error
			const firstErrorElement = document.querySelector(".border-destructive-foreground");
			firstErrorElement?.scrollIntoView({ behavior: "smooth", block: "center" });
			return;
		}

		// Create FHIR QuestionnaireResponse
		const response = createQuestionnaireResponse(questionnaire, questionnaireState.answers);

		// Call the onSubmit handler
		if (onSubmit) {
			onSubmit(response);
		}

		submitting = false;
	}
</script>

<div class="flex flex-1 flex-col space-y-4">
	<QuestionnaireNavigation
		previousDisabled={questionnaireState.currentIndex === 0}
		previous={questionnaireState.previousQuestion}
		nextDisabled={questionnaireState.currentIndex === questionnaireState.flattenedGroups.length - 1}
		next={handleNext}
	/>
	<div class="h-full">
		{#if currentGroup}
			<QuestionGroup
				parentItem={currentGroup.parentItem}
				items={currentGroup.children}
				answers={questionnaireState.answers}
				onAnswer={(linkId, value) => questionnaireState.setAnswer(linkId, value)}
			/>
		{/if}

		{#if isLastPage}
			<div class="mt-6 flex flex-col items-center justify-center gap-4">
				<p class="text-center text-muted-foreground">
					{m.questionnaire_review_answers()}
				</p>

				<Button
					variant="default"
					size="lg"
					disabled={!isValid || submitting}
					onclick={handleSubmit}
					class="px-8"
				>
					<CheckCircle class="mr-2 h-5 w-5" />
					{submitting ? m.questionnaire_submitting() : m.questionnaire_submit()}
				</Button>
			</div>
		{/if}

		{#if questionnaireState.errors.size > 0}
			<!-- The class `border-destructive-foreground` is used as query selector to scroll the first error into view -->
			<div class="mt-4 rounded-lg border border-destructive-foreground bg-destructive p-4">
				<p class="font-medium text-destructive-foreground">{m.questionnaire_please_fix_errors()}</p>
				<ul class="mt-2 list-inside list-disc">
					{#each [...questionnaireState.errors] as [linkId, message]}
						<li class="text-destructive-foreground">{message}</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
	<QuestionnaireProgress
		currentIndex={questionnaireState.currentIndex}
		totalSteps={questionnaireState.flattenedGroups.length}
		answers={questionnaireState.answers}
	/>
</div>
