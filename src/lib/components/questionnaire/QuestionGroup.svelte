<!-- src/lib/components/questionnaire/QuestionGroup.svelte -->
<script lang="ts">
	import type { QuestionnaireItem } from "fhir/r4";
	import QuestionComponent from "./QuestionComponent.svelte";
	import type { QuestionnaireAnswer } from "$lib/stores/questionnaireStore.svelte";

	interface Props {
		parentItem: QuestionnaireItem;
		items: QuestionnaireItem[];
		answers: Map<string, QuestionnaireAnswer>;
		onAnswer: (linkId: string, value: any) => void;
	}
	let { parentItem, items, answers, onAnswer }: Props = $props();
</script>

<div class="space-y-6">
	{#if items.length !== 0 && parentItem.text}
		<h3 class="mt-0">
			{#if parentItem.prefix}
				<span class="mr-1">{parentItem.prefix}</span>
			{/if}
			{parentItem.text}
		</h3>
	{/if}

	<div class="space-y-4">
		{#if items.length === 0}
			<QuestionComponent
				item={parentItem}
				answer={answers.get(parentItem.linkId)}
				onAnswer={(value) => onAnswer(parentItem.linkId, value)}
			/>
		{:else}
			{#each items as item (item.linkId)}
				<QuestionComponent
					{item}
					answer={answers.get(item.linkId)}
					onAnswer={(value) => onAnswer(item.linkId, value)}
				/>
			{/each}
		{/if}
	</div>
</div>
