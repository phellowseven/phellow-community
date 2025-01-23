<!-- src/lib/components/questionnaire/items/ChoiceQuestion.svelte -->
<script lang="ts">
	import Check from "lucide-svelte/icons/check";
	import type { ItemComponentInterface } from "./itemComponentInterface";
	import Button from "$ui/button/button.svelte";

	let { item, value = undefined, onAnswer }: ItemComponentInterface<string> = $props();

	const options = item.answerOption ?? [];
</script>

<div class="flex flex-col gap-2">
	{#each options as option}
		{@const optionValue = option.valueString ?? option.valueCoding?.code ?? ""}
		{@const display = option.valueString ?? option.valueCoding?.display ?? optionValue}

		<Button
			variant={value === optionValue ? "default" : "outline"}
			class={[]}
			onclick={() => onAnswer(optionValue)}
		>
			<div
				class="flex h-5 w-5 items-center justify-center rounded-full border border-secondary-foreground"
			>
				{#if value === optionValue}
					<Check class="h-4 w-4 " />
				{/if}
			</div>
			<span>{display}</span>
		</Button>
	{/each}
</div>
