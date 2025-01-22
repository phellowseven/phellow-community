<script lang="ts">
	import type { Questionnaire, QuestionnaireItem } from 'fhir/r4';
	import { Icon, ArrowLeft, ArrowRight } from 'svelte-hero-icons';
	import QuestionnaireItemRenderer from './QuestionnaireItemRenderer.svelte';
	import { onMount } from 'svelte';
	import QuestionnaireNavigation from './QuestionnaireNavigation.svelte';
	import { validatePage } from '../../questionnaires/validation';

	export let resource: Questionnaire;

	let currentPage = 0;
	let formData: Record<string, any> = {};
	let enabledPages: QuestionnaireItem[] = [];
	let errors: Record<string, string> = {};

	// Calculate if the next button should be disabled
	$: isNextDisabled = !validatePage([currentItem], formData).isValid;

	// Recursively inject questionnaire reference into all items
	function injectQuestionnaireRef(items: QuestionnaireItem[]): QuestionnaireItem[] {
		return items.map((item) => ({
			...item,
			_questionnaire: resource,
			item: item.item ? injectQuestionnaireRef(item.item) : undefined
		}));
	}

	// Process top level items with questionnaire reference
	$: topLevelItems = resource.item ? injectQuestionnaireRef(resource.item) : [];

	// Function to check if an item should be enabled based on conditions
	function isItemEnabled(item: QuestionnaireItem): boolean {
		if (!item.enableWhen || item.enableWhen.length === 0) return true;

		return item.enableWhen.every((condition) => {
			const dependentValue = formData[condition.question];

			// Handle different answer types
			if (condition.answerString !== undefined) {
				return condition.operator === '='
					? dependentValue === condition.answerString
					: dependentValue !== condition.answerString;
			}

			if (condition.answerBoolean !== undefined) {
				return condition.operator === 'exists'
					? !!dependentValue === condition.answerBoolean
					: dependentValue === condition.answerBoolean;
			}

			if (condition.answerDecimal !== undefined) {
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

			return false;
		});
	}

	// Update enabled pages whenever form data changes
	$: {
		enabledPages = topLevelItems.filter((item) => isItemEnabled(item));

		// If current page is no longer enabled, find the next available page
		if (enabledPages.length > 0 && !isItemEnabled(topLevelItems[currentPage])) {
			const nextEnabledIndex = enabledPages.findIndex((item, index) => index > currentPage);
			if (nextEnabledIndex !== -1) {
				currentPage = nextEnabledIndex;
			} else {
				currentPage = Math.max(0, enabledPages.length - 1);
			}
		}
	}

	$: totalPages = enabledPages.length;
	$: currentItem = enabledPages[currentPage];
	$: progress = ((currentPage + 1) / totalPages) * 100;

	function handleNext() {
		// Validate current page before proceeding
		const validation = validatePage([currentItem], formData);

		if (!validation.isValid) {
			errors = validation.errors;
			return;
		}

		errors = {};

		if (currentPage < totalPages - 1) {
			let nextPage = currentPage + 1;
			while (nextPage < totalPages && !isItemEnabled(topLevelItems[nextPage])) {
				nextPage++;
			}
			if (nextPage < totalPages) {
				currentPage = nextPage;
			}
		}
	}

	function handlePrevious() {
		if (currentPage > 0) {
			let prevPage = currentPage - 1;
			while (prevPage >= 0 && !isItemEnabled(topLevelItems[prevPage])) {
				prevPage--;
			}
			if (prevPage >= 0) {
				currentPage = prevPage;
			}
		}
	}

	function updateFormData(event: CustomEvent<{ linkId: string; value: any }>) {
		const { linkId, value } = event.detail;

		// Create new form data object to trigger reactivity
		formData = {
			...formData,
			[linkId]: value
		};

		// Debug logging
		// console.group('Form Data Update');
		// console.log('Updated linkId:', linkId);
		// console.log('New value:', value);
		// console.log('Current form data:', formData);
		// console.log(
		// 	'Enabled pages:',
		// 	enabledPages.map((p) => p.linkId)
		// );
		// console.log('Current page:', currentPage);
		// console.groupEnd();
	}

	// Initialize form data with any default values
	onMount(() => {
		const initialData: Record<string, any> = {};

		function processItem(item: QuestionnaireItem) {
			if (item.initial && item.initial[0]) {
				const initial = item.initial[0];
				if ('valueQuantity' in initial) {
					initialData[item.linkId] = {
						value: initial.valueQuantity?.value,
						unit: initial.valueQuantity?.unit
					};
				} else if ('valueString' in initial) {
					initialData[item.linkId] = initial.valueString;
				} else if ('valueBoolean' in initial) {
					initialData[item.linkId] = initial.valueBoolean;
				}
			}

			if (item.item) {
				item.item.forEach(processItem);
			}
		}

		topLevelItems.forEach(processItem);
		formData = initialData;
	});
</script>

<div class="w-full">
	<h1 class="mb-6 text-2xl font-bold">{resource.title}</h1>

	{#if resource.description}
		<p class="mb-6 text-gray-600">{resource.description}</p>
	{/if}

	<!-- Form content -->
	<div class="mb-8 shrink">
		<div class="rounded-lg bg-white p-6 shadow-md">
			{#if currentItem}
				<QuestionnaireItemRenderer
					item={currentItem}
					{formData}
					{errors}
					on:change={updateFormData}
				/>
			{:else}
				<p class="py-4 text-center text-gray-500">No more questions to display</p>
			{/if}
		</div>
	</div>

	<!-- Navigation -->
	<QuestionnaireNavigation
		{currentPage}
		{totalPages}
		{progress}
		{isNextDisabled}
		on:next={handleNext}
		on:previous={handlePrevious}
	/>
</div>
