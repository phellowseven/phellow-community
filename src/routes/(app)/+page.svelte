<script module lang="ts">
	import * as m from "$lib/paraglide/messages";
	export const pageTitle = m.dashboard_title();
</script>

<script lang="ts">
	import type { PageData } from "./$types";
	import { headPageTitle } from "$lib/utils";
	import AppLayout from "./_appLayout.svelte";

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
		<h1>Welcome {data.user?.name}</h1>
	{/snippet}
</AppLayout>
