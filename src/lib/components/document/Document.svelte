<script lang="ts">
	import type { Dayjs } from "dayjs";
	import * as m from "$lib/paraglide/messages";
	import File from "lucide-svelte/icons/file";

	interface Props {
		title?: string;
		createdAt?: Dayjs;
		author?: string;
		type?: string;
		href?: string;
		class?: string;
	}

	let { title, createdAt, author, type, href, class: classes, ...props }: Props = $props();
</script>

<a {href} class={classes} {...props}>
	<div class="flex w-full flex-row items-center">
		<File class="mr-4 h-4 w-4 shrink-0 sm:mr-6 sm:h-6 sm:w-6" />
		<div class="flex flex-col">
			<p class="flex flex-col items-baseline sm:flex-row">
				<span class="font-semibold">
					{title ?? m.document()}
				</span>
				{#if type}
					<span class="ml-0 text-sm sm:ml-2">({type})</span>
				{/if}
			</p>
			<div class="flex flex-col text-muted-foreground sm:flex-row">
				{#if createdAt}
					<time datetime={createdAt?.format("YYYY-MM-DD")}>
						{createdAt?.format(m.document_createdDate_format())}
					</time>
				{/if}
				{#if author}
					<span class="mx-2 hidden sm:block">-</span>
					<span>{author}</span>
				{/if}
			</div>
		</div>
	</div>
</a>
