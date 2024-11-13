<!-- src/routes/structured/[coding]/+page.svelte -->
<script lang="ts">
	import { pageTitle } from '$lib/util';
	import * as m from '$lib/paraglide/messages';

	import { blur } from 'svelte/transition';
	import StickyHeader from '$components/StickyHeader.svelte';
	import { P } from 'flowbite-svelte';
	import type { PageData } from './$types';
	import ObservationLineChart from '$components/Observations/ObservationLineChart.svelte';
	import LabResultsTable from '$components/Observations/LabResultsTable.svelte';

	export let data: PageData;
</script>

<svelte:head>
	<title>{pageTitle('Graph für Laborwert')}</title>
</svelte:head>

<div in:blur={{ duration: 200 }} class="my-8">
	<!-- Header -->
	<StickyHeader>
		<div class="flex items-start justify-between lg:flex-row">
			<P class="text-3xl font-extrabold"
				>{data.observations[0].code?.text ||
					data.observations[0].code?.coding?.[0]?.display ||
					m.observation_unknown()}</P
			>
		</div>
	</StickyHeader>

	<!-- Chart -->
	<div class="mt-6">
		<ObservationLineChart observations={data.observations} />
	</div>

	<!-- Table -->
	<div class="mt-6">
		<LabResultsTable
			observations={data.observations}
			onSort={(_) => {}}
			onTypeSelect={(_) => {}}
			sortBy="date"
			sortOrder="desc"
			isInteractive={false}
		/>
	</div>
</div>
