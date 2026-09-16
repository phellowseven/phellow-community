<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { onClickOutside } from "runed";
	import { mode } from "mode-watcher";
	import pdfiumWasmUrl from "@embedpdf/pdfium/pdfium.wasm?url";
	import type {
		PDFViewer as EmbedPDFViewer,
		PDFViewerConfig,
		ZoomMode,
	} from "@embedpdf/svelte-pdf-viewer";
	import { getLocale } from "$lib/paraglide/runtime";
	import { Skeleton } from "$components/ui/skeleton";

	interface Props {
		/** URL (typically a blob object URL) the PDF bytes are fetched from */
		url: string;
		/** Display name of the document */
		name?: string;
	}

	const { url, name }: Props = $props();

	let container = $state<HTMLDivElement | null>(null);
	let Viewer = $state<typeof EmbedPDFViewer | null>(null);
	let buffer = $state<ArrayBuffer | null>(null);
	let error = $state<unknown>(null);

	/**
	 * Clear selection when clicking outside the viewer so that drawers can be dragged.
	 */
	const { stop: stopClickOutside } = onClickOutside(
		() => container,
		() => {
			window?.getSelection()?.empty();
		}
	);

	onMount(async () => {
		try {
			/**
			 * EmbedPDF touches `window` on init, so load it on the client only.
			 */
			const [module, response] = await Promise.all([
				import("@embedpdf/svelte-pdf-viewer"),
				fetch(url),
			]);
			buffer = await response.arrayBuffer();
			Viewer = module.PDFViewer;
		} catch (err) {
			console.error("[PDFViewer] failed to load document", err);
			error = err;
		}
	});

	onDestroy(() => {
		stopClickOutside();
	});

	const config = $derived<PDFViewerConfig>({
		// Self-host the PDFium engine instead of pulling it from jsDelivr. The engine worker runs
		// from a blob: URL, so the WASM URL has to be absolute to resolve from inside the worker.
		wasmUrl: new URL(pdfiumWasmUrl, window.location.href).href,
		// No CDN fallback fonts and no Google Fonts for the UI.
		fontFallback: null,
		fonts: { ui: null, signature: null },
		// The stamp plugin would otherwise fetch its default library manifest from jsDelivr.
		stamp: { defaultLibrary: false, manifests: [] },
		documentManager: {
			initialDocuments: buffer
				? // The engine transfers the buffer to its worker, so hand over a copy per mount.
					[{ buffer: buffer.slice(0), name: name ?? "document.pdf", documentId: "preview" }]
				: [],
		},
		tabBar: "never",
		theme: { preference: mode.current === "dark" ? "dark" : "light" },
		i18n: { defaultLocale: getLocale(), fallbackLocale: "en" },
		// ZoomMode is a string enum; only the type is imported to keep the module SSR-safe.
		zoom: { defaultZoomLevel: "fit-page" as unknown as ZoomMode },
		disabledCategories: [
			"annotation",
			"redaction",
			"form",
			"insert",
			"history",
			"document-open",
			"document-close",
			"document-protect",
			"document-capture",
			"panel-comment",
			"security",
			"tools",
		],
	});
</script>

<div class="absolute inset-0" data-vaul-no-drag data-testid="pdf-viewer" bind:this={container}>
	{#if Viewer && buffer}
		{#key mode.current}
			<Viewer {config} style="width: 100%; height: 100%;" />
		{/key}
	{:else if error}
		<p class="text-destructive p-4">Das Dokument konnte nicht geladen werden.</p>
	{:else}
		<Skeleton class="bg-secondary h-full w-full" />
	{/if}
</div>
