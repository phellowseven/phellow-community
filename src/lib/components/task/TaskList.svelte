<script lang="ts">
	import type { Task } from "fhir/r4";
	import TaskItem from "./TaskItem.svelte";

	interface Props {
		tasks?: Task[];
	}

	let { tasks = [] }: Props = $props();
</script>

<div class="flex flex-col gap-4">
	{#if tasks.length === 0}
		<p class="p-4 text-center">No tasks found</p>
	{:else}
		{#each tasks as task (task.id)}
			<TaskItem {task} />
		{/each}
	{/if}
</div>
