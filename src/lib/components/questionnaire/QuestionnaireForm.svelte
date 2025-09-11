<script lang="ts">
	import type { Questionnaire, QuestionnaireResponse } from "fhir/r4";

	import * as m from "$lib/paraglide/messages";

	import QuestionnaireRenderer from "$components/questionnaire/QuestionnaireRenderer.svelte";

	import * as Alert from "$components/ui/alert";
	import { Button } from "$components/ui/button";

	import CheckCircle from "@lucide/svelte/icons/check-circle";
	import RefreshCw from "@lucide/svelte/icons/refresh-cw";

	interface Props {
		resource: Questionnaire;
		onSubmit?: (response: QuestionnaireResponse) => void;
		canStartOver?: boolean;
	}

	let { resource, onSubmit, canStartOver = false }: Props = $props();

	let submitted = $state(false);
	let response = $state<QuestionnaireResponse | null>(null);

	function handleSubmit(questionnaireResponse: QuestionnaireResponse) {
		response = questionnaireResponse;
		submitted = true;

		if (onSubmit) {
			onSubmit(questionnaireResponse);
		}
	}

	function startOver() {
		submitted = false;
		response = null;
	}
</script>

<div class="flex flex-1 flex-col gap-8">
	<h3 class="mt-0 pb-0">{resource.title}</h3>

	{#if resource.description}
		<p class="text-muted-foreground">{resource.description}</p>
	{/if}

	{#if !submitted}
		<div class="flex flex-1 flex-col">
			<QuestionnaireRenderer questionnaire={resource} onSubmit={handleSubmit} />
		</div>
	{:else}
		<Alert.Root class="bg-sidebar">
			<CheckCircle class="size-5" />
			<Alert.Title>{m.questionnaire_submission_complete()}</Alert.Title>
			<Alert.Description>
				{m.questionnaire_submission_received()}
			</Alert.Description>
		</Alert.Root>

		{#if canStartOver}
			<div class="flex justify-center">
				<Button onclick={startOver} variant="outline">
					<RefreshCw class="mr-2 size-4" />
					{m.questionnaire_start_over()}
				</Button>
			</div>
		{/if}

		{#if import.meta.env.APP_ENV === "development"}
			<div class="bg-card rounded-lg border p-4">
				<h3 class="mt-0">QuestionnaireResponse (Debug)</h3>
				<pre class="overflow-auto text-xs">{JSON.stringify(response, null, 2)}</pre>
			</div>
		{/if}
	{/if}
</div>
