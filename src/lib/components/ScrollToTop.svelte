<script lang="ts">
	import type { Snippet } from "svelte";
	import { cn } from "$lib/utils";
	import { fade } from "svelte/transition";

	interface Props {
		children: Snippet;
		class?: string;
		showOnPx?: number;
	}

	let { children, showOnPx = 150, class: classes }: Props = $props();

	let hidden = $state(true);

	function goToTop() {
		document.body.scrollIntoView({ behavior: "smooth" });
	}

	function scrollContainer() {
		return document.documentElement || document.body;
	}

	function handleOnScroll() {
		if (!scrollContainer()) {
			return;
		}

		if (scrollContainer().scrollTop > showOnPx) {
			hidden = false;
		} else {
			hidden = true;
		}
	}
</script>

<svelte:window onscroll={handleOnScroll} />

{#if !hidden}
	<button
		in:fade
		class={cn(
			"bg-primary/50 text-primary-foreground hover:bg-primary fixed right-4 bottom-4 z-50 mx-auto flex items-center justify-center rounded-lg text-center shadow-md transition duration-300 ease-in-out select-none hover:shadow-lg md:right-6",
			classes
		)}
		onclick={goToTop}
	>
		{@render children()}
	</button>
{/if}
