<script lang="ts">
	import type { QuestionnaireItem } from 'fhir/r4';
	import { createEventDispatcher } from 'svelte';

	export let item: QuestionnaireItem;
	export let value: string | undefined = undefined;
	export let required = false;
	export let error: string | undefined = undefined;

	const dispatch = createEventDispatcher();

	function handleChange(selectedValue: string) {
		dispatch('change', {
			linkId: item.linkId,
			value: selectedValue
		});
	}

	function hasValueString(option: any): option is { valueString: string } {
		return typeof option?.valueString === 'string';
	}

	$: options = (item.answerOption || []).filter(hasValueString).map((option) => ({
		value: option.valueString,
		label: option.valueString
	}));
</script>

<div class="py-2">
	<fieldset>
		<legend class="mb-2 block text-sm font-medium text-gray-700">
			{item.text}
			{#if required}
				<span class="ml-1 text-red-500">*</span>
			{/if}
		</legend>

		<div class="space-y-2">
			{#each options as option}
				<label class="flex items-center space-x-3">
					<input
						type="radio"
						name={item.linkId}
						value={option.value}
						checked={value === option.value}
						on:change={() => handleChange(option.value)}
						class="h-4 w-4 {error
							? 'border-red-300 text-red-600'
							: 'border-gray-300 text-blue-600'} focus:ring-blue-500"
						aria-describedby={error ? `${item.linkId}-error` : undefined}
					/>
					<span class="text-sm text-gray-900">{option.label}</span>
				</label>
			{/each}
		</div>
	</fieldset>

	{#if error}
		<p class="mt-1 text-sm text-red-600" id={`${item.linkId}-error`}>
			{error}
		</p>
	{/if}
</div>
