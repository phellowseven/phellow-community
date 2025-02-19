<!-- src/lib/components/questionnaire/items/OpenChoiceQuestion.svelte -->
<script lang="ts">
	import { Button } from "$ui/button";
	import { Input } from "$ui/input";

	import Check from "lucide-svelte/icons/check";
	import Plus from "lucide-svelte/icons/plus";
	import type { ItemComponentInterface } from "./itemComponentInterface";
	import { tick, type SvelteComponent } from "svelte";

	let {
		item,
		value = undefined,
		onAnswer,
	}: ItemComponentInterface<{ code: string; text: string }> = $props();

	const options = item.answerOption ?? [];

	let showCustomInput = $state(
		value !== null &&
			!options.some(
				(opt) => opt.valueString === value?.text || opt.valueCoding?.code === value?.code
			)
	);

	// svelte-ignore state_referenced_locally
	let customValue = $state(showCustomInput && value ? value.text : "");

	$effect(() => (customValue.trim() ? handleCustomValueSubmit() : undefined));

	function handleCustomValueSubmit() {
		if (customValue.trim()) {
			onAnswer({
				code: `phellow-community:customOpenChoice`,
				text: customValue,
			});
		}
	}

	function addOption() {
		onAnswer(undefined);
		showCustomInput = true;
	}

	function clearCustomValue() {
		customValue = "";
		showCustomInput = false;
		onAnswer(undefined);
	}

	function selectOption(option: { code: string; text: string }) {
		showCustomInput = false;
		onAnswer(option);
	}
</script>

<div class="flex flex-col gap-2">
	<!-- Predefined options -->
	{#each options as option}
		{@const optionCode = option.valueCoding?.code ?? option.valueString ?? ""}
		{@const display = option.valueString ?? option.valueCoding?.display ?? optionCode}

		<Button
			variant={value?.code === optionCode ? "default" : "outline"}
			onclick={() => selectOption({ code: optionCode, text: display })}
			type="button"
		>
			<div
				class={[
					"flex h-5 w-5 items-center justify-center rounded-full border",
					value?.code === optionCode ? "border-primary-foreground" : "border-muted-foreground",
				]}
			>
				{#if value?.code === optionCode}
					<Check class="h-4 w-4" />
				{/if}
			</div>
			<span>{display}</span>
		</Button>
	{/each}

	<!-- Custom input option -->
	{#if !showCustomInput}
		<Button variant="default" onclick={addOption}>
			<div
				class="flex h-5 w-5 items-center justify-center rounded-full border border-primary-foreground"
			>
				<Plus class="h-4 w-4" />
			</div>
			<span>Add other option...</span>
		</Button>
	{:else}
		<div class="flex items-center gap-2">
			<Input
				type="text"
				autofocus={true}
				placeholder="Enter your own answer"
				bind:value={customValue}
				onkeydown={(e) => e.key === "Enter" && handleCustomValueSubmit()}
			/>
			<Button variant="destructive" onclick={clearCustomValue}>Remove</Button>
		</div>
	{/if}
</div>
