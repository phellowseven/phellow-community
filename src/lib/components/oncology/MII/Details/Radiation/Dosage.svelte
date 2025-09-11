<script lang="ts">
	import Zap from "@lucide/svelte/icons/zap";

	interface Props {
		totalDose: string;
		singleDose: string;
		boost: string;
	}

	let { totalDose, singleDose, boost }: Props = $props();
</script>

<div class="border-border bg-card rounded-lg border p-4 shadow-xs">
	<h3 class="mt-0 mb-4 font-medium">Dosierung</h3>
	<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
		<div class="flex items-center gap-2">
			<div class="bg-muted rounded-full p-2">
				<Zap class="text-muted-foreground" size={16} />
			</div>
			<div>
				<div class="font-medium">Gesamtdosis</div>
				<div class="text-muted-foreground">{totalDose}</div>
			</div>
		</div>

		<div class="flex items-center gap-2">
			<div class="bg-muted rounded-full p-2">
				<Zap class="text-muted-foreground" size={16} />
			</div>
			<div>
				<div class="font-medium">Einzeldosis</div>
				<div class="text-muted-foreground">{singleDose}</div>
			</div>
		</div>

		<div class="flex items-center gap-2">
			<div class="bg-muted rounded-full p-2">
				<Zap class="text-muted-foreground" size={16} />
			</div>
			<div>
				<div class="font-medium">Boost</div>
				<div class="text-muted-foreground">{boost}</div>
			</div>
		</div>
	</div>
</div>
