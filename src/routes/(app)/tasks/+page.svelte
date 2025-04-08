<script lang="ts" module>
	export function getPageTitle() {
		return m.tasks_title();
	}
</script>

<script lang="ts">
	import type { PageData } from "./$types";
	import AppLayout from "../_appLayout.svelte";

	import * as m from "$lib/paraglide/messages";
	import { headPageTitle } from "$lib/utils";

	import NoContent from "$components/NoContent.svelte";
	import TaskList from "$components/task/TaskList.svelte";
	import Spinner from "$components/Spinner.svelte";

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>{headPageTitle(m.tasks_title())}</title>
</svelte:head>

<AppLayout title={getPageTitle()}>
	{#snippet children()}
		{#await data.tasks}
			<Spinner />
		{:then tasks}
			{#if Object.keys(tasks).length === 0}
				<NoContent />
			{:else}
				<div class="flex flex-col gap-8">
					{#each Object.keys(tasks) as key (key)}
						<section>
							<h2>{key}</h2>
							<TaskList tasks={tasks[key]} />
						</section>
					{/each}
				</div>
			{/if}
		{/await}
	{/snippet}
</AppLayout>
