<script lang="ts">
	import type { Task } from 'fhir/r4';
	import { Card } from 'flowbite-svelte';
	import { Icon, ChevronRight } from 'svelte-hero-icons';

	export let task: Task;
	export let clickable: boolean = true;

	// Map status to color
	function statusColor(status: string) {
		switch (status) {
			case 'requested':
				return 'bg-blue-100 text-blue-800';
			case 'completed':
				return 'bg-green-100 text-green-800';
			case 'cancelled':
				return 'bg-gray-100 text-gray-800';
			case 'failed':
				return 'bg-red-100 text-red-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}
</script>

<Card
	horizontal={true}
	size="lg"
	class="flex w-full max-w-full items-center gap-4"
	href={clickable ? `/tasks/${task.id}` : undefined}
>
	<div class="flex-1">
		<div class="mb-4 flex flex-row items-center justify-start gap-2">
			<p class="font-medium">
				{task.description}
			</p>
			<span class="rounded-full px-2 py-0.5 text-xs {statusColor(task.status)}">
				{task.status}
			</span>
			{#if task.priority === 'urgent'}
				<span class="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-800"> Urgent </span>
			{/if}
		</div>
		<div class="mt-1 flex flex-col gap-1 text-sm text-gray-500">
			{#if task.requester?.display}
				<span>Requested by: {task.requester.display}</span>
			{/if}
			{#if task.focus?.display}
				<span>Item to complete: {task.focus?.display}</span>
			{/if}
		</div>
	</div>
	{#if clickable}
		<Icon src={ChevronRight} class="h-5 w-5 flex-shrink-0 text-gray-400" />
	{/if}
</Card>
