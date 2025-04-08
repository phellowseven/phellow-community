<script module lang="ts">
	export function getPageTitle() {
		return m.module_oncology();
	}
</script>

<script lang="ts">
	import AppLayout from "../../_appLayout.svelte";
	import type { PageData } from "./$types";
	import * as m from "$lib/paraglide/messages";

	let { data }: { data: PageData } = $props();
</script>

<AppLayout title={getPageTitle()}>
	{#snippet children()}{/snippet}
</AppLayout>
