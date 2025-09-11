<script lang="ts">
	import Activity from "@lucide/svelte/icons/activity";
	import AlertTriangle from "@lucide/svelte/icons/alert-triangle";
	import CheckCircle from "@lucide/svelte/icons/check-circle";

	interface Props {
		complications: string[];
		outcome: string;
		status: string;
	}

	let { complications, outcome, status }: Props = $props();
</script>

<div class="border-border bg-card flex flex-col gap-4 rounded-lg border p-4 shadow-xs">
	<h3 class="mt-0 font-medium">Komplikationen</h3>
	{#each complications as complication}
		<div class="mb-2 flex items-start gap-2">
			<AlertTriangle class="mt-0.5 shrink-0" size={16} />
			<div class="text-muted-foreground">{complication}</div>
		</div>
	{/each}

	<h3 class="mt-2 mb-2 font-medium">Operationsergebnis</h3>
	<div class="flex items-start gap-2">
		<CheckCircle class="mt-0.5 shrink-0" size={16} />
		<div>
			<div class="font-medium">Residualstatus</div>
			<div class="text-muted-foreground">{outcome}</div>
		</div>
	</div>

	<div class="flex items-start gap-2">
		<Activity class="mt-0.5 shrink-0" size={16} />
		<div>
			<div class="font-medium">Status</div>
			<div class="text-muted-foreground">{status}</div>
		</div>
	</div>
</div>
