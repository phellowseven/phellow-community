<script lang="ts">
	import type { QuestionnaireItem, Questionnaire } from 'fhir/r4';
	import DisplayItem from './items/DisplayItem.svelte';
	import ChoiceItem from './items/ChoiceItem.svelte';
	import TextItem from './items/TextItem.svelte';
	import QuantityItem from './items/QuantityItem.svelte';
	import ValueSetChoice from './items/ValueSetChoice.svelte';
	import GroupItem from './items/GroupItem.svelte';

	export let item: QuestionnaireItem;
	export let formData: Record<string, any>;
	export let errors: Record<string, string> = {};

	// Determine if we should use ValueSetChoice or regular ChoiceItem
	$: isValueSetChoice = item.type === 'choice' && item.answerValueSet;

	function getComponent(type: QuestionnaireItem['type']): any {
		switch (type) {
			case 'choice':
				if (isValueSetChoice) {
					return ValueSetChoice;
				} else {
					return ChoiceItem;
				}
			case 'display':
				return DisplayItem;
			case 'text':
				return TextItem;
			case 'quantity':
				return QuantityItem;
			case 'group':
				return GroupItem;
			// Placeholder for other item types
			case 'string':
				return TextItem;
			case 'boolean':
				return TextItem;
			case 'time':
				return TextItem;
			case 'question':
				return TextItem;
			case 'decimal':
				return TextItem;
			case 'integer':
				return TextItem;
			case 'date':
				return TextItem;
			case 'dateTime':
				return TextItem;
			case 'url':
				return TextItem;
			case 'open-choice':
				return TextItem;
			case 'attachment':
				return TextItem;
			case 'reference':
				return TextItem;
			default:
				break;
		}
	}

	// Function to get props based on component type
	function getComponentProps(type: string) {
		const baseProps = {
			item,
			required: !!item.required
		};

		switch (type) {
			case 'display':
				return baseProps;
			case 'group':
				return {
					...baseProps,
					formData,
					errors
				};
			default:
				return {
					...baseProps,
					error: errors[item.linkId],
					value: formData[item.linkId]
				};
		}
	}

	function isItemEnabled(item: QuestionnaireItem): boolean {
		if (!item.enableWhen || item.enableWhen.length === 0) return true;

		return item.enableWhen.every((condition) => {
			const dependentValue = formData[condition.question];

			// Handle different answer types
			if (condition.answerString !== undefined) {
				// For string/choice answers
				return condition.operator === '='
					? dependentValue === condition.answerString
					: dependentValue !== condition.answerString;
			}

			if (condition.answerBoolean !== undefined) {
				// For boolean answers
				return condition.operator === 'exists'
					? !!dependentValue === condition.answerBoolean
					: dependentValue === condition.answerBoolean;
			}

			if (condition.answerDecimal !== undefined) {
				// For numeric answers
				const numValue = parseFloat(dependentValue);
				switch (condition.operator) {
					case '=':
						return numValue === condition.answerDecimal;
					case '!=':
						return numValue !== condition.answerDecimal;
					case '>':
						return numValue > condition.answerDecimal;
					case '>=':
						return numValue >= condition.answerDecimal;
					case '<':
						return numValue < condition.answerDecimal;
					case '<=':
						return numValue <= condition.answerDecimal;
					default:
						return false;
				}
			}

			// If no matching condition type is found, return false
			return false;
		});
	}

	// For debugging enableWhen conditions
	// $: {
	// 	if (item.enableWhen && item.enableWhen.length > 0) {
	// 		console.group(`EnableWhen debug for ${item.linkId}`);
	// 		console.log('Item:', item);
	// 		console.log('EnableWhen conditions:', item.enableWhen);
	// 		console.log('Current form data:', formData);
	// 		console.log('Is enabled:', isItemEnabled(item));
	// 		console.groupEnd();
	// 	}
	// }
</script>

<div>
	{#if isItemEnabled(item)}
		<svelte:component this={getComponent(item.type)} {...getComponentProps(item.type)} on:change />

		{#if errors[item.linkId]}
			<p class="mt-1 text-sm text-red-600">
				{errors[item.linkId]}
			</p>
		{/if}

		<!-- {#if item.item}
			{#each item.item as subItem (subItem.linkId)}
				<div class="ml-6 mt-4">
					<svelte:self item={subItem} {formData} {errors} on:change />
				</div>
			{/each}
		{/if} -->
	{/if}
</div>
