<!-- src/lib/components/questionnaire/QuestionnaireRenderer.svelte -->
<script lang="ts">
	import type { Questionnaire } from "fhir/r4";

	import * as m from "$lib/paraglide/messages";

	import { createQuestionnaireState } from "$lib/stores/questionnaireStore.svelte";

	import QuestionnaireNavigation from "./QuestionnaireNavigation.svelte";
	import QuestionGroup from "./QuestionGroup.svelte";
	import QuestionnaireProgress from "./QuestionnaireProgress.svelte";

	interface Props {
		questionnaire: Questionnaire;
	}

	let { questionnaire }: Props = $props();

	const state = createQuestionnaireState(questionnaire);

	let currentGroup = $derived.by(() => {
		const currentItem = state.currentGroup;
		return currentItem;
	});

	function handleNext() {
		state.nextQuestion();
		if (state.errors.size > 0) {
			// Scroll to first error
			const firstErrorElement = document.querySelector(".border-destructive-foreground");
			firstErrorElement?.scrollIntoView({ behavior: "smooth", block: "center" });
		}
	}
</script>

<div class="flex flex-1 flex-col space-y-4">
	<QuestionnaireNavigation
		previousDisabled={state.currentIndex === 0}
		previous={state.previousQuestion}
		nextDisabled={state.currentIndex === state.flattenedGroups.length - 1}
		next={handleNext}
	/>
	<div class="h-full">
		{#if currentGroup}
			<QuestionGroup
				parentItem={currentGroup.parentItem}
				items={currentGroup.children}
				answers={state.answers}
				onAnswer={(linkId, value) => state.setAnswer(linkId, value)}
			/>
		{/if}

		{#if state.errors.size > 0}
			<div class="mt-4 rounded-lg border border-destructive-foreground bg-destructive p-4">
				<p class="font-medium text-destructive-foreground">{m.questionnaire_please_fix_errors()}</p>
				<ul class="mt-2 list-inside list-disc">
					{#each [...state.errors] as [linkId, message]}
						<li class="text-destructive-foreground">{message}</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
	<QuestionnaireProgress
		currentIndex={state.currentIndex}
		totalSteps={state.flattenedGroups.length}
		answers={state.answers}
	/>
</div>
