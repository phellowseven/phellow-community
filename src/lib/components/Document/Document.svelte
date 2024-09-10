<script lang="ts">
	import type { Dayjs } from 'dayjs';
	import { Card, P } from 'flowbite-svelte';
	import { Document, Icon } from 'svelte-hero-icons';
	import * as m from '$lib/paraglide/messages';

	export let title: string | undefined = undefined;
	export let createdAt: Dayjs | undefined = undefined;
	export let author: string | undefined = undefined;
	export let type: string | undefined = undefined;
	export let href: string | undefined = undefined;
</script>

<Card horizontal={true} size="lg" class="w-full max-w-full" {href}>
	<div class="flex w-full flex-row items-center">
		<Icon src={Document} class="mr-6 h-6 w-6 shrink-0" />
		<div class="flex flex-col">
			<P>
				<span>
					{title ?? m.document()}
				</span>
				{#if type}
					<span class="ml-2 text-sm text-gray-500">({type})</span>
				{/if}
			</P>
			<div class="flex flex-row">
				{#if createdAt}
					<span>{createdAt?.format(m.document_createdDate_format())}</span>
				{/if}
				{#if author}
					<span class="mx-2">-</span>
					<span>{author}</span>
				{/if}
			</div>
		</div>
	</div>
</Card>
