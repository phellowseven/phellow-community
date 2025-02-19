<script module lang="ts">
	export async function getPageTitle(data: PageData) {
		const task = await data.task;
		return task.task.focus?.display;
	}
</script>

<script lang="ts">
	import type { PageData } from "./$types";
	import AppLayout from "../../_appLayout.svelte";

	import { headPageTitle } from "$lib/utils";
	import * as m from "$lib/paraglide/messages";

	import QuestionnaireForm from "$components/questionnaire/QuestionnaireForm.svelte";
	import Spinner from "$components/Spinner.svelte";

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let componentMap: Record<string, any> = {
		Questionnaire: QuestionnaireForm,
	};
</script>

<svelte:head>
	<title>{headPageTitle(m.tasks_title())}</title>
</svelte:head>

<AppLayout>
	{#snippet children()}
		{#await data.task}
			<Spinner />
		{:then task}
			{#if task.focus}
				{@const SvelteComponent = componentMap[task.focus.resourceType]}
				<div class="flex flex-1 flex-col">
					<SvelteComponent resource={task.focus} />
				</div>
			{/if}
		{:catch}
			<p>Failed to load task</p>
		{/await}
	{/snippet}
</AppLayout>
