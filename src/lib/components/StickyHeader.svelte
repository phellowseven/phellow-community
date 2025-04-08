<script lang="ts">
	import type { Snippet } from "svelte";

	interface Props {
		class?: string;
		children: Snippet;
	}

	let { children, class: classes }: Props = $props();
</script>

<div
	class={[
		"sticky top-4 z-20 ml-auto w-fit py-6 pr-4 transition-all ease-linear md:top-2",
		"-mt-[110px] h-[90px]",
		classes,
	]}
>
	{@render children()}
</div>
