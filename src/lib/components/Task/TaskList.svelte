<script lang="ts">
	import type { Task } from 'fhir/r4';
	import TaskItem from './TaskItem.svelte';

	export let tasks: Task[] = [];
</script>

<div class="divide-y divide-gray-200 rounded-lg bg-white shadow">
	{#if tasks.length === 0}
		<p class="p-4 text-center text-gray-500">No tasks found</p>
	{:else}
		{#each tasks as task (task.id)}
			<TaskItem {task} />
		{/each}
	{/if}
</div>
