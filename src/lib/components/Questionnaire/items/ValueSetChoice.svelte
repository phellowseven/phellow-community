<script lang="ts">
	import type { Questionnaire, QuestionnaireItem, ValueSet } from 'fhir/r4';
	import { createEventDispatcher } from 'svelte';

	export let item: QuestionnaireItem;
	export let value: string | undefined = undefined;
	const dispatch = createEventDispatcher();

	// Extract the ValueSet from contained resources if it exists
	$: valueSet = (function () {
		return item.answerValueSet?.startsWith('#') ? item.answerValueSet.substring(1) : undefined;
	})();

	// Function to get options from contained ValueSet
	function getOptionsFromValueSet(valueSetId: string) {
		const questionnaire = (item as any)._questionnaire as Questionnaire;
		if (!questionnaire?.contained) return [];

		const valueSetResource = questionnaire.contained.find(
			(resource) => resource.resourceType === 'ValueSet' && resource.id === valueSetId
		) as ValueSet;

		if (!valueSetResource?.compose?.include?.[0]?.concept) return [];

		return valueSetResource.compose.include[0].concept.map((concept) => ({
			code: concept.code,
			display: concept.display
		}));
	}

	$: options = valueSet
		? getOptionsFromValueSet(valueSet)
		: (item.answerOption || []).map((option) => ({
				code: option.valueString,
				display: option.valueString
			}));

	function handleChange(selectedValue: string | undefined) {
		dispatch('change', {
			linkId: item.linkId,
			value: selectedValue
		});
	}
</script>

<div class="py-2">
	<fieldset>
		<legend class="mb-3 block text-sm font-medium text-gray-900">
			{item.text}
		</legend>

		<div class="space-y-3">
			{#each options as option}
				<label class="flex cursor-pointer items-start gap-3">
					<input
						type="radio"
						name={item.linkId}
						value={option.code}
						checked={value === option.code}
						on:change={() => handleChange(option.code)}
						class="mt-1 h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
					/>
					<span class="text-sm leading-tight text-gray-700">
						{option.display}
					</span>
				</label>
			{/each}
		</div>
	</fieldset>
</div>
