<script lang="ts">
	import type { Questionnaire } from "fhir/r4";
	import QuestionnaireRenderer from "$components/questionnaire/QuestionnaireRenderer.svelte";

	interface Props {
		resource: Questionnaire;
	}

	let { resource }: Props = $props();
</script>

<div class="flex flex-1 flex-col space-y-4">
	<h2 class="mt-0 pb-0">{resource.title}</h2>

	{#if resource.description}
		<p class="text-muted-foreground">{resource.description}</p>
	{/if}

	<div class="flex flex-1 flex-col">
		<QuestionnaireRenderer questionnaire={resource} />
	</div>
</div>
