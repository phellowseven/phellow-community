<script lang="ts">
	import { route } from "$lib/ROUTES";
	import { encodeBase64url } from "@oslojs/encoding";
	import type { Task } from "fhir/r4";
	import ChevronRight from "lucide-svelte/icons/chevron-right";

	export let task: Task;
	export let clickable: boolean = true;

	// Map status to color
	function statusColor(status: string) {
		switch (status) {
			case "requested":
				return "bg-blue-100 text-blue-800";
			case "completed":
				return "bg-green-100 text-green-800";
			case "cancelled":
				return "bg-gray-100 text-gray-800";
			case "failed":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	}
</script>

<svelte:element
	this={clickable ? "a" : "div"}
	class={[
		"flex w-full max-w-full items-center rounded-lg px-4 py-2 shadow md:px-6 md:py-6",
		clickable ? "cursor-pointer bg-card/70 hover:bg-card hover:shadow-lg" : "bg-card",
	]}
	href={clickable && task.id
		? route("/tasks/[id]", { id: encodeBase64url(new TextEncoder().encode(task.id)) })
		: undefined}
>
	<div class="flex-1">
		<div class="mb-4 flex flex-row items-center justify-start gap-2">
			<p class="font-medium">
				{task.description}
			</p>
			<span class={["rounded-full px-2 py-0.5 text-xs", statusColor(task.status)]}>
				{task.status}
			</span>
			{#if task.priority === "urgent"}
				<span class="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-800">urgent</span>
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
		<ChevronRight class="h-5 w-5 flex-shrink-0 " />
	{/if}
</svelte:element>
