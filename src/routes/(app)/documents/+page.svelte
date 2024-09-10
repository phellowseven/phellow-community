<script lang="ts" context="module">
	// This is a context="module" script, so that the search survives navigation.
	import { writable } from 'svelte/store';
	let search = writable<string>('');
</script>

<script lang="ts">
	import { open } from '$lib/components/Drawer/Drawer.svelte';
	import { pageTitle } from '$lib/util';
	import { P, Search, Button, ButtonGroup } from 'flowbite-svelte';
	import { blur } from 'svelte/transition';
	import StickyHeader from '$components/StickyHeader.svelte';
	import type { PageData } from './$types';
	import { Icon, DocumentPlus } from 'svelte-hero-icons';
	import Document from '$components/Document/Document.svelte';
	import dayjs from 'dayjs';
	import {
		documentTypeStringForDocumentReference,
		extractAuthorFullName,
		groupByMonth
	} from '$lib/document';
	import { sortBy } from 'lodash-es';
	import * as m from '$lib/paraglide/messages';
	import GroupHeadingPlaceholder from '$components/Placeholder/GroupHeadingPlaceholder.svelte';
	import DocumentPlaceholder from '$components/Document/DocumentPlaceholder.svelte';

	export let data: PageData;

	$: groupedDocuments = data.entries.then((documents) =>
		sortBy(
			Object.entries(
				groupByMonth(
					documents.filter((document) => {
						if ($search.length === 0) return true;

						return document.description?.toLowerCase().includes($search.toLowerCase());
					})
				)
			),
			([key]) => key
		).reverse()
	);
</script>

<svelte:head>
	<title>{pageTitle('Documents')}</title>
</svelte:head>

<div in:blur={{ duration: 200 }} class="my-8">
	<StickyHeader>
		<div class="flex flex-col items-start justify-between md:flex-row md:items-end">
			<P class="text-3xl font-extrabold">{m.documents_title()}</P>
			<div class="mt-8 space-x-px align-top md:mt-0">
				<ButtonGroup class="mt-8 space-x-px align-top md:mt-0">
					<Button
						on:click={() =>
							open({
								type: 'upload-document',
								data: data.uploadDocumentForm
							})}
						class="align-center inline-flex justify-center"
						color="primary"
						><Icon src={DocumentPlus} class="mr-2" size="20" mini />Dokument hochladen</Button
					>
				</ButtonGroup>
			</div>
		</div>
	</StickyHeader>

	<Search bind:value={$search} class="z-0 mb-4" placeholder={m.searchbar_placeholder()} />

	<div class="flex w-full flex-col items-start">
		{#await groupedDocuments}
			<GroupHeadingPlaceholder />
			<DocumentPlaceholder />
		{:then entries}
			{#each entries as [group, documents] (group)}
				<h2 class="mb-2 mt-8 rounded-lg bg-[#d0f5ec] p-2 text-lg font-bold text-[#109b77]">
					{dayjs(group).format(m.documents_group_header_date_format())}
				</h2>
				<ul class="flex w-full flex-col space-y-2">
					{#each documents as document (document.id)}
						<li>
							<Document
								title={document.description}
								createdAt={document.date ? dayjs(document.date) : undefined}
								author={extractAuthorFullName(document) ?? undefined}
								type={documentTypeStringForDocumentReference(document)}
								href={document.content[0].attachment.url}
							/>
						</li>
					{/each}
				</ul>
			{/each}
		{/await}
	</div>
</div>
