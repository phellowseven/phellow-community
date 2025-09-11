<!-- src/lib/components/questionnaire/items/TextQuestion.svelte -->
<script lang="ts">
	import type { ItemComponentInterface } from "./itemComponentInterface";

	import { Input } from "$ui/input";
	import { Textarea } from "$ui/textarea";

	let { item, value = "", onAnswer }: ItemComponentInterface<string> = $props();

	let error = $state("");

	function handleInput(e: Event) {
		const input = e.target as HTMLInputElement;
		error = "";

		if (item.maxLength && input.value.length > item.maxLength) {
			error = `Maximum length is ${item.maxLength} characters`;
			return;
		}

		onAnswer(input.value);
	}
</script>

<div class="flex flex-col gap-2">
	{#if item.type === "text"}
		<!-- content here -->
		<Textarea {value} oninput={handleInput} maxlength={item.maxLength} />
	{:else if item.type === "url"}
		<Input type="url" {value} oninput={handleInput} maxlength={item.maxLength} />
	{:else}
		<Input type="text" {value} oninput={handleInput} maxlength={item.maxLength} />
	{/if}
	{#if error}
		<span class="text-destructive-foreground text-sm">{error}</span>
	{/if}
</div>
