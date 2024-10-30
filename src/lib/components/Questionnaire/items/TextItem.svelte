<script lang="ts">
	import type { QuestionnaireItem } from 'fhir/r4';
	import { createEventDispatcher } from 'svelte';

	export let item: QuestionnaireItem;
	export let value: string | undefined = undefined;

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
	</label>

	<input
		type="text"
		id={item.linkId}
		value={value || ''}
		on:input={handleInput}
		class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
	/>
</div>
