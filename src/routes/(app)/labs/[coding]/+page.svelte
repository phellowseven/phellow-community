<!-- src/routes/structured/[coding]/+page.svelte -->
<script lang="ts" module>
	export function getPageTitle(data: PageData) {
		return (
			data.observations[0].code?.text ||
			data.observations[0].code?.coding?.[0]?.display ||
			m.observation_unknown()
		);
	}
</script>

<script lang="ts">
	import type { PageData } from "./$types";

	import * as m from "$lib/paraglide/messages";
	import { headPageTitle } from "$lib/utils";

	import ObservationLineChart from "$components/observations/ObservationLineChart.svelte";
	import LabResultsTable from "$components/observations/LabResultsTable.svelte";
	import AppLayout from "../../_appLayout.svelte";

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>{headPageTitle("Graph für Laborwert")}</title>
</svelte:head>

<AppLayout>
	{#snippet children()}
		<!-- Chart -->
		<ObservationLineChart observations={data.observations} />

		<!-- Table -->
		<LabResultsTable
			observations={data.observations}
			onSort={(_) => {}}
			onTypeSelect={(_) => {}}
			sortBy="date"
			sortOrder="desc"
			isInteractive={false}
		/>
	{/snippet}
</AppLayout>
