<script lang="ts">
	import StickyHeader from "$components/StickyHeader.svelte";
	import type { Snippet } from "svelte";
	import { blur } from "svelte/transition";

	interface Props {
		title?: string;
		portal?: Snippet;
		stickyHeader?: Snippet;
		children?: Snippet;
	}

	let { title, portal, stickyHeader, children }: Props = $props();
</script>

{#if portal}
	{@render portal()}
{/if}

{#if stickyHeader}
	<StickyHeader>
		<div class="flex h-full flex-row items-center justify-end">
			{@render stickyHeader()}
		</div>
	</StickyHeader>
{/if}
<div
	in:blur={{ duration: 200 }}
	class={[
		"flex flex-1 flex-col space-y-4 md:space-y-8",
		stickyHeader ? "mt-[36px] md:mt-[52px]" : "mt-4 md:mt-8",
	]}
>
	{#if title}
		<h1>{title}</h1>
	{/if}
	{#if children}
		{@render children()}
	{/if}
</div>
