<script lang="ts">
	import type { QuestionnaireItem } from 'fhir/r4';
	import QuestionnaireItemRenderer from '../QuestionnaireItemRenderer.svelte';

	export let item: QuestionnaireItem;
	export let formData: Record<string, any>;
	export let errors: Record<string, string> = {};
	export let required = false;

	function formatLinkId(linkId: string): string {
		return linkId.includes('.') ? linkId.split('.')[1].toUpperCase() : linkId;
	}
</script>

<div class="py-4">
	{#if item.text}
		<fieldset class="mb-4 border-b border-gray-200 pb-4">
			<legend class="mb-4 text-lg font-medium text-gray-900">
				{item.text}
				{#if required}
					<span class="ml-1 text-red-500">*</span>
				{/if}
			</legend>

			{#if item.item}
				<div class="space-y-6">
					{#each item.item as subItem}
						<div class="flex gap-4">
							{#if subItem.linkId.includes('.')}
								<div class="w-8 font-medium text-gray-500">
									{formatLinkId(subItem.linkId)}
								</div>
							{/if}
							<div class="flex-1">
								<QuestionnaireItemRenderer item={subItem} {formData} {errors} on:change />
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</fieldset>
	{/if}
</div>
