<script lang="ts">
	import type { QuestionnaireItem } from 'fhir/r4';
	import { createEventDispatcher } from 'svelte';

	export let item: QuestionnaireItem;
	export let value: string | undefined = undefined;

	const dispatch = createEventDispatcher();

	function handleChange(selectedValue: string) {
		dispatch('change', {
			linkId: item.linkId,
			value: selectedValue
		});
	}

	// Type guard to check if the answer option has a valueString
	function hasValueString(option: any): option is { valueString: string } {
		return typeof option?.valueString === 'string';
	}

	// Filter and transform options to ensure they have valueString
	$: options = (item.answerOption || []).filter(hasValueString).map((option) => ({
		value: option.valueString,
		label: option.valueString
	}));
</script>

<div class="py-2">
	<label class="mb-2 block text-sm font-medium text-gray-700">
		{item.text}
	</label>

	<div class="space-y-2">
		{#each options as option}
			<label class="flex items-center space-x-3">
				<input
					type="radio"
					name={item.linkId}
					value={option.value}
					checked={value === option.value}
					on:change={() => handleChange(option.value)}
					class="h-4 w-4 text-blue-600 focus:ring-blue-500"
				/>
				<span class="text-gray-900">{option.label}</span>
			</label>
		{/each}
	</div>
</div>
