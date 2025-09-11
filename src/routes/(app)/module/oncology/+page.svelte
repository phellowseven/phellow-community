<script module lang="ts">
	export function getPageTitle() {
		return m.module_oncology();
	}
</script>

<script lang="ts">
	import AppLayout from "../../_appLayout.svelte";
	import type { PageData } from "./$types";
	import * as m from "$lib/paraglide/messages";
	import Timeline from "$components/oncology/Timeline/Timeline.svelte";

	let { data }: { data: PageData } = $props();
</script>

<AppLayout title={getPageTitle()}>
	{#snippet children()}
		<p class="text-muted-foreground leading-7 tracking-tight">
			<strong>Hinweis:</strong> Diese Seite befindet sich noch in der Entwicklung und die dargestellten
			Daten können Fehler enthalten. Für verlässliche und individuelle Informationen wenden Sie sich
			bitte an Ihre behandelnde Fachperson.
		</p>
		<Timeline events={data.events} bundle={data.bundle} />
	{/snippet}
</AppLayout>
