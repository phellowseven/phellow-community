<script lang="ts">
	import { Skeleton } from "$components/ui/skeleton";
	import ArrowRight from "@lucide/svelte/icons/arrow-right";
	import type { Snippet } from "svelte";
	import * as m from "$lib/paraglide/messages";

	interface Props {
		icon: Snippet;
		count: Promise<number | undefined>;
		description: string;
		href: string;
	}

	let { count, description, href, icon: Icon }: Props = $props();
</script>

<div class="relative overflow-hidden rounded-lg bg-card px-4 pb-12 pt-5 shadow-sm sm:px-6 sm:pt-6">
	<dt>
		<div class="absolute transform rounded-md bg-primary p-3 transition-transform hover:scale-105">
			{@render Icon()}
		</div>
		<p class="ml-16 truncate text-sm font-medium text-muted-foreground">{description}</p>
	</dt>
	<dd class="ml-16 flex items-baseline pb-6 sm:pb-7">
		{#await count}
			<Skeleton class="h-8 w-12" />
		{:then number}
			<p class="text-2xl font-semibold">{number ?? 0}</p>
		{/await}
		<div class="absolute inset-x-0 bottom-0 bg-primary px-4 py-4 sm:px-6">
			<div class="text-sm">
				<a {href} class="inline-flex items-center font-medium text-white/90 hover:text-white">
					{m.dashboard_show_all()}
					<ArrowRight class="ml-1 size-4" />
				</a>
			</div>
		</div>
	</dd>
</div>
