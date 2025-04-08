<!-- src/lib/components/InfoRow.svelte -->
<script lang="ts">
	import type { Snippet } from "svelte";
	import { Label } from "$ui/label";

	interface Prop {
		label?: string;
		id?: string;
		value?: string;
		labelChild?: Snippet<[id: string | undefined]>;
		valueChild?: Snippet<[id: string | undefined]>;
	}

	let { id, label, value, labelChild, valueChild }: Prop = $props();
</script>

<div class="flex flex-col items-start sm:flex-row">
	<div class="mb-1 w-full sm:mb-0 sm:w-1/3 md:w-1/4">
		{#if label}
			<Label for={id}>
				{label}
			</Label>
		{:else if labelChild}
			{@render labelChild(id)}
		{/if}
	</div>
	<div class="w-full sm:w-2/3">
		{#if value}
			<span {id}>
				{value}
			</span>
		{:else if valueChild}
			{@render valueChild(id)}
		{:else}{/if}
	</div>
</div>
