<script lang="ts">
	import AppLayout from "../../_appLayout.svelte";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();
</script>

<AppLayout>
	{#snippet children()}
		<h1>Onkologie</h1>
	{/snippet}
</AppLayout>
