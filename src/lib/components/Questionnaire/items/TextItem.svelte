<script lang="ts">
	import type { QuestionnaireItem } from 'fhir/r4';
	import { createEventDispatcher } from 'svelte';

	export let item: QuestionnaireItem;
	export let value: string | undefined = undefined;
	export let required = false;
	export let error: string | undefined = undefined;

	const dispatch = createEventDispatcher();

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		dispatch('change', {
			linkId: item.linkId,
			value: target.value
		});
	}
</script>

<div class="py-2">
	<label for={item.linkId} class="mb-2 block text-sm font-medium text-gray-700">
		{item.text}
		{#if required}
			<span class="ml-1 text-red-500">*</span>
		{/if}
	</label>

	<input
		type="text"
		id={item.linkId}
		value={value || ''}
		on:input={handleInput}
		class="mt-1 block w-full rounded-md shadow-sm sm:text-sm
		{error
			? 'border-red-300 focus:border-red-500 focus:ring-red-500'
			: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}"
		aria-invalid={!!error}
		aria-describedby={error ? `${item.linkId}-error` : undefined}
	/>

	{#if error}
		<p class="mt-1 text-sm text-red-600" id={`${item.linkId}-error`}>
			{error}
		</p>
	{/if}
</div>
