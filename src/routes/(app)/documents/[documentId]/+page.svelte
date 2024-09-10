<script lang="ts">
	import { A, Button, Kbd, Spinner } from 'flowbite-svelte';
	import { onDestroy, onMount } from 'svelte';
	import type { PageData } from './$types';
	import { blur } from 'svelte/transition';
	import { goto, afterNavigate } from '$app/navigation';
	import * as m from '$lib/paraglide/messages';

	let previousPage: string | undefined;

	let loading = true;
	let objectURL: string | undefined;

	onMount(async () => {
		const response = await fetch('');

		objectURL = URL.createObjectURL(await response.blob());

		loading = false;
	});

	onDestroy(() => {
		objectURL && URL.revokeObjectURL(objectURL);
	});

	afterNavigate(({ from }) => {
		previousPage = from?.url.pathname;
	});

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			goto(previousPage ?? `/documents`);
		}
	}
</script>

<svelte:window on:keydown={onKeydown} />

<section in:blur class="flex h-screen flex-col">
	<nav
		class="flex flex-row justify-between bg-gray-50 px-6 py-4 dark:border-b dark:border-gray-600 dark:bg-gray-900"
	>
		<A
			href={previousPage ?? `/documents`}
			color="black"
			class="inline-flex items-center space-x-2 whitespace-nowrap text-lg font-medium dark:text-white"
		>
			<Kbd class="px-2 py-1.5">{m.documents_document_esc_button()}</Kbd>
		</A>

		<Button type="button" download="document.pdf" href={objectURL} disabled={!objectURL}>
			{m.documents_document_download_button()}
		</Button>
	</nav>

	{#if loading}
		<div class="flex h-full w-full grow items-center justify-center bg-gray-800">
			<Spinner color="blue" />
		</div>
	{:else}
		<embed src={objectURL} type="application/pdf" class="h-full w-full grow" />
	{/if}
</section>
