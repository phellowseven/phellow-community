<!-- src/lib/components/questionnaire/items/OpenChoiceQuestion.svelte -->
<script lang="ts">
	import { Button } from "$ui/button";
	import { Input } from "$ui/input";

	import Check from "@lucide/svelte/icons/check";
	import Plus from "@lucide/svelte/icons/plus";
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
	{#each options as option (option.valueString ?? option.valueCoding?.code ?? option.valueCoding?.display ?? option)}
		{@const optionCode = option.valueCoding?.code ?? option.valueString ?? ""}
		{@const display = option.valueString ?? option.valueCoding?.display ?? optionCode}

		<Button
			variant={value?.code === optionCode ? "default" : "outline"}
			class="flex h-auto w-full items-center justify-start gap-2 text-left whitespace-normal"
			onclick={() => selectOption({ code: optionCode, text: display })}
			type="button"
		>
			<div
				class={[
					"flex size-5 flex-shrink-0 items-center justify-center rounded-full border",
					value?.code === optionCode ? "border-secondary-foreground" : "border-muted-foreground",
				]}
			>
				{#if value?.code === optionCode}
					<Check class="size-4" />
				{/if}
			</div>
			<span class="leading-relaxed break-words">{display}</span>
		</Button>
	{/each}

	<!-- Custom input option -->
	{#if !showCustomInput}
		<Button variant="default" onclick={addOption}>
			<div
				class="border-primary-foreground flex size-5 items-center justify-center rounded-full border"
			>
				<Plus class="size-4" />
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
