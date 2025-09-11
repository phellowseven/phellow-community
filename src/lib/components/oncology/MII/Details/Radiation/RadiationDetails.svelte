<script lang="ts">
	import Zap from "@lucide/svelte/icons/zap";
	import Target from "@lucide/svelte/icons/target";
	import Timer from "@lucide/svelte/icons/timer";

	interface Props {
		application: string;
		type: string;
		target: string;
		laterality: string | null;
	}

	let { application, type, target, laterality }: Props = $props();
</script>

<div class="border-border bg-card flex flex-col gap-4 rounded-lg border p-4 shadow-xs">
	<h3 class="mt-0 font-medium">Bestrahlungsdetails</h3>

	<div class="flex items-start gap-2">
		<Zap class="mt-0.5 shrink-0" size={16} />
		<div>
			<div class="font-medium">Strahlenart</div>
			<div class="text-muted-foreground">{type}</div>
		</div>
	</div>

	<div class="flex items-start gap-2">
		<Timer class="mt-0.5 shrink-0" size={16} />
		<div>
			<div class="font-medium">Applikationsart</div>
			<div class="text-muted-foreground">{application}</div>
		</div>
	</div>

	<div class="flex items-start gap-2">
		<Target class="mt-0.5 shrink-0" size={16} />
		<div>
			<div class="font-medium">Zielgebiet</div>
			<div class="text-muted-foreground">
				{target}
				{#if laterality}
					<span class="text-sm">({laterality})</span>
				{/if}
			</div>
		</div>
	</div>
</div>
