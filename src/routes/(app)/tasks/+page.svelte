<script lang="ts">
	import StickyHeader from '$components/StickyHeader.svelte';
	import { pageTitle } from '$lib/util';
	import { Heading, P, Secondary } from 'flowbite-svelte';
	import { blur } from 'svelte/transition';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';
	import TaskList from '$components/Task/TaskList.svelte';

	export let data: PageData;
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

	{#await data.tasks}
		<p>Loading…</p>
	{:then tasks}
		{#if Object.keys(tasks).length === 0}
			<div class="mt-48 flex justify-center text-center">
				<div>
					<Heading class="text-2xl font-bold">{m.no_content()}</Heading>
					<Secondary class="text-xl font-medium">{m.no_content_description()}</Secondary>
				</div>
			</div>
		{:else}
			<div class="flex flex-col gap-8">
				{#each Object.keys(tasks) as key (key)}
					<section>
						<h3 class="font-xl mb-4 font-bold">{key}</h3>
						<TaskList tasks={tasks[key]} />
					</section>
				{/each}
			</div>
		{/if}
	{/await}
</div>
