<script lang="ts">
	import { pageTitle } from '$lib/util';
	import { blur } from 'svelte/transition';
	import * as m from '$lib/paraglide/messages';
	import { P } from 'flowbite-svelte';

	import type { PageData } from './$types';
	import StickyHeader from '$components/StickyHeader.svelte';
	import TaskItem from '$components/Task/TaskItem.svelte';
	import QuestionnaireForm from '$components/Questionnaire/QuestionnaireForm.svelte';

	export let data: PageData;

	let componentMap: Record<string, any> = {
		Questionnaire: QuestionnaireForm
	};
</script>

<svelte:head>
	<title>{pageTitle(m.tasks_title())}</title>
</svelte:head>

<div in:blur={{ duration: 200 }} class="my-8">
	<StickyHeader>
		<div class="flex items-start justify-between lg:flex-row">
			<P class="text-3xl font-extrabold">{m.tasks_title()}</P>
		</div>
	</StickyHeader>

	{#await data.task}
		<p>Loading…</p>
	{:then task}
		<TaskItem task={task.task} clickable={false} />

		{#if task.focus}
			<div class="mt-8">
				<svelte:component this={componentMap[task.focus.resourceType]} resource={task.focus} />
			</div>
		{/if}
	{:catch}
		<p>Failed to load task</p>
	{/await}
</div>
