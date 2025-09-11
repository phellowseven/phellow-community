<!-- src/lib/components/questionnaire/items/IntegerQuestion.svelte -->
<script lang="ts">
	import type { ItemComponentInterface } from "./itemComponentInterface";

	import Input from "$ui/input/input.svelte";

	let { item, value = undefined, onAnswer }: ItemComponentInterface<number> = $props();

	let error = $state("");

	function handleInput(e: Event) {
		const input = e.target as HTMLInputElement;
		const num = input.value === "" ? undefined : parseFloat(input.value);
		error = "";

		if (num !== undefined && isNaN(num)) {
			error = "Please enter a valid number";
			return;
		}

		onAnswer(num);
	}
</script>

<div class="flex flex-col gap-2">
	<Input type="number" value={value ?? ""} oninput={handleInput} step={0.1} />
	{#if error}
		<span class="text-destructive-foreground text-sm">{error}</span>
	{/if}
</div>
