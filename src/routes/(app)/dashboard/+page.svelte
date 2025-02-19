<script module lang="ts">
	export function getPageTitle() {
		return m.dashboard_title();
	}
</script>

<script lang="ts">
	import type { PageData } from "./$types";

	import { headPageTitle } from "$lib/utils";
	import { route } from "$lib/ROUTES";
	import * as m from "$lib/paraglide/messages";

	import AppLayout from "../_appLayout.svelte";

	import OverviewCard from "$components/dashboard/OverviewCard.svelte";

	import File from "lucide-svelte/icons/file";
	import Calendar from "lucide-svelte/icons/calendar";
	import Todo from "lucide-svelte/icons/list-todo";
	import Flask from "lucide-svelte/icons/flask-conical";

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>{headPageTitle()}</title>
</svelte:head>

<AppLayout>
	{#snippet children()}
		{#if data.user.name}
			<h1>{m.welcome_name({ name: data.user.name })}</h1>
		{:else}
			<h1>{m.welcome()}</h1>
		{/if}
		<dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			<OverviewCard
				count={data.documentReferenceBundleResponse}
				description={m.dashboard_number_documents()}
				href={route("/documents")}
			>
				{#snippet icon()}
					<File class="size-6 text-white" />
				{/snippet}
			</OverviewCard>
			<OverviewCard
				count={data.appointmentBundleResponse}
				description={m.dashboard_number_appointments()}
				href={route("/appointments")}
			>
				{#snippet icon()}
					<Calendar class="size-6 text-white" />
				{/snippet}
			</OverviewCard>
			<OverviewCard
				count={data.taskBundleResponse}
				description={m.dashboard_number_tasks()}
				href={route("/tasks")}
			>
				{#snippet icon()}
					<Todo class="size-6 text-white" />
				{/snippet}
			</OverviewCard>
			<OverviewCard
				count={data.observationBundleResponse}
				description={m.dashboard_number_observations()}
				href={route("/labs")}
			>
				{#snippet icon()}
					<Flask class="size-6 text-white" />
				{/snippet}
			</OverviewCard>
		</dl>
	{/snippet}
</AppLayout>
