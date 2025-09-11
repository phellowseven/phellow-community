<script lang="ts">
	import Shell from "@lucide/svelte/icons/shell";
	import FlaskRound from "@lucide/svelte/icons/flask-round";
	import Target from "@lucide/svelte/icons/target";

	interface Props {
		primaryTumorStatus?: {
			color: string;
			display: string;
		};
		lymphNodeStatus?: {
			color: string;
			display: string;
		};
		metastasisStatus?: {
			color: string;
			display: string;
		};
	}

	let { primaryTumorStatus, lymphNodeStatus, metastasisStatus }: Props = $props();
</script>

<div class="border-border bg-card flex flex-col gap-6 rounded-lg border p-4 shadow-xs">
	<h3 class="mt-0 font-medium">Detaillierter Status</h3>

	{#if primaryTumorStatus}
		<div class="flex items-start gap-2">
			<Shell class="mt-0.5 shrink-0" size={16} />
			<div>
				<div class="font-medium">Primärtumor</div>
				<div class="mt-1 flex items-center gap-2">
					<span class={["inline-block size-3 shrink-0 rounded-full", primaryTumorStatus.color]}
					></span>
					<div class="text-muted-foreground">{primaryTumorStatus.display}</div>
				</div>
			</div>
		</div>
	{/if}

	{#if lymphNodeStatus}
		<div class="flex items-start gap-2">
			<Target class="mt-0.5 shrink-0" size={16} />
			<div>
				<div class="font-medium">Lymphknoten</div>
				<div class="mt-1 flex items-center gap-2">
					<span class={["inline-block size-3 shrink-0 rounded-full", lymphNodeStatus.color]}></span>
					<div class="text-muted-foreground">{lymphNodeStatus.display}</div>
				</div>
			</div>
		</div>
	{/if}

	{#if metastasisStatus}
		<div class="flex items-start gap-2">
			<FlaskRound class="mt-0.5 shrink-0" size={16} />
			<div>
				<div class="font-medium">Fernmetastasen</div>
				<div class="mt-1 flex items-center gap-2">
					<span class={["inline-block size-3 shrink-0 rounded-full", metastasisStatus.color]}
					></span>
					<div class="text-muted-foreground">{metastasisStatus.display}</div>
				</div>
			</div>
		</div>
	{/if}
</div>
