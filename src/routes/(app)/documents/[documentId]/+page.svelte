<script module lang="ts">
	export function getPageTitle(data: PageData) {
		return data.document.description ?? m.document();
	}
</script>

<script lang="ts">
	import type { PageData } from "./$types";
	import AppLayout from "../../_appLayout.svelte";

	import { onDestroy, onMount } from "svelte";

	import * as m from "$lib/paraglide/messages";
	import { canShowPreviewForDocumentContent } from "$lib/fhir/document";

	import { Button } from "$ui/button";

	import Download from "@lucide/svelte/icons/download";

	import { Skeleton } from "$components/ui/skeleton";
	import DocumentMetadataTable from "$components/document/DocumentMetadataTable.svelte";
	import PdfViewer from "$components/PDFViewer.svelte";

	let { data }: { data: PageData } = $props();

	let loading = $state(true);
	let objectURL: string | undefined = $state(undefined);
	let contentType: string | undefined = $state(data.document.content[0].attachment.contentType);

	onMount(async () => {
		if (
			data.document.content.length > 0 &&
			canShowPreviewForDocumentContent(data.document.content[0])
		) {
			const attachmentURL = data.document.content[0].attachment.url;
			if (!attachmentURL) {
				loading = false;
				return;
			}
			const response = await fetch(attachmentURL);

			objectURL = URL.createObjectURL(await response.blob());
		}

		loading = false;
	});

	onDestroy(() => {
		objectURL && URL.revokeObjectURL(objectURL);
	});
</script>

<svelte:head>
	<title>{data.document.description ?? m.document()}</title>
</svelte:head>

<AppLayout>
	{#snippet stickyHeader()}
		<Button
			type="button"
			download="{data.document.description}.pdf"
			href={objectURL}
			disabled={!objectURL}
		>
			<Download class="sr mr-2 size-4" />{m.documents_document_download_button()}
		</Button>
	{/snippet}
	{#snippet children()}
		{#if loading}
			<p>Loading…</p>
		{:else}
			<h1>{data.document.description}</h1>

			<DocumentMetadataTable document={data.document} />

			{#if loading}
				<Skeleton class="bg-secondary min-h-svh w-full" />
			{:else if objectURL}
				{#if contentType == "application/pdf"}
					<div class="relative flex min-h-svh">
						<PdfViewer url={objectURL} />
					</div>
				{/if}
			{/if}
		{/if}
	{/snippet}
</AppLayout>
