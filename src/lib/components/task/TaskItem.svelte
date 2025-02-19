<script lang="ts">
	import { encodeBase64url } from "@oslojs/encoding";
	import type { Task } from "fhir/r4";

	import { route } from "$lib/ROUTES";
	import * as m from "$lib/paraglide/messages";

	import ChevronRight from "lucide-svelte/icons/chevron-right";
	import { statusColor, statusText } from ".";

	export let task: Task;
	export let clickable: boolean = true;
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
				{statusText(task.status)}
			</span>
			{#if task.priority === "urgent"}
				<span class="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-800"
					>{m.task_item_status_urgent()}</span
				>
			{/if}
		</div>
		<div class="mt-1 flex flex-col gap-1 text-sm text-muted-foreground">
			{#if task.requester?.display}
				<span>{m.task_item_requested_by_name({ name: task.requester.display })}</span>
			{/if}
			{#if task.focus?.display}
				<span>{m.task_item_focus({ name: task.focus?.display })}</span>
			{/if}
		</div>
	</div>
	{#if clickable}
		<ChevronRight class="h-5 w-5 flex-shrink-0 " />
	{/if}
</svelte:element>
