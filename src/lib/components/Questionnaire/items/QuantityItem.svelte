<script lang="ts">
	import type { QuestionnaireItem } from 'fhir/r4';
	import { createEventDispatcher } from 'svelte';

	export let item: QuestionnaireItem;
	export let value: { value: number; unit: string } | undefined = undefined;

	const dispatch = createEventDispatcher();

	// Get the unit from the initial value if present
	$: unit = item.initial?.[0]?.valueQuantity?.unit || '';

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		dispatch('change', {
			linkId: item.linkId,
			value: {
				value: parseFloat(target.value),
				unit
			}
		});
	}
</script>

<div class="py-2">
	<label for={item.linkId} class="mb-2 block text-sm font-medium text-gray-700">
		{item.text}
	</label>

	<div class="flex items-center space-x-2">
		<input
			type="number"
			id={item.linkId}
			value={value?.value || item.initial?.[0]?.valueQuantity?.value || ''}
			on:input={handleInput}
			class="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
		/>
		<span class="text-gray-500">{unit}</span>
	</div>
</div>
