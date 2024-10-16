<script lang="ts" context="module">
	// This is a context="module" script, so that the search survives navigation.
	import { writable } from 'svelte/store';
	let search = writable<string>('');
</script>

<script lang="ts">
	import StickyHeader from '$components/StickyHeader.svelte';
	import { pageTitle } from '$lib/util';
	import { P, Search } from 'flowbite-svelte';
	import type { PageData } from './$types';
	import { blur } from 'svelte/transition';
	import { sortBy } from 'lodash-es';
	import * as m from '$lib/paraglide/messages';
	import { groupByCoding } from '$lib/observation';

	import TableGroup from '$components/Observations/TableGroup.svelte';

	export let data: PageData;

	$: groupedObservations = data.entries.then((observations) =>
		sortBy(
			Object.entries(
				groupByCoding(
					observations.filter((obs) => {
						if ($search.length === 0) return true;
						const codingText =
							obs.code.text ?? obs.code.coding?.at(0)?.display ?? obs.code.coding?.at(0)?.code;
						return codingText?.toLowerCase().includes($search.toLowerCase()) ?? true;
					})
				)
			),
			([key]) => key.toLowerCase()
		)
	);
</script>

<svelte:head>
	<title>{pageTitle('Structured Data')}</title>
</svelte:head>

<div in:blur={{ duration: 200 }} class="my-8">
	<StickyHeader>
		<div class="flex flex-col items-start justify-between md:flex-row md:items-end">
			<P class="text-3xl font-extrabold">{m.structuredData_title()}</P>
		</div>
	</StickyHeader>

	<Search bind:value={$search} class="z-0 mb-4" placeholder={m.searchbar_placeholder()} />

	<div class="flex w-full flex-col items-start">
		{#await groupedObservations}
			<div>Loading…</div>
		{:then entries}
			{#each entries as [group, observations] (group)}
				<TableGroup title={group} {observations} />
			{/each}
		{/await}
	</div>
</div>
