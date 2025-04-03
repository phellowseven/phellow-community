<script lang="ts">
	import "@pdfslick/core/dist/pdf_viewer.css";

	import type { PDFSlick } from "@pdfslick/core";
	import { onMount, onDestroy } from "svelte";
	import { ZoomOut, ChevronLeft, ChevronRight, ZoomIn } from "lucide-svelte/icons";
	import Button from "$lib/components/ui/button/button.svelte";
	import { onClickOutside, useResizeObserver } from "runed";
	import * as m from "$lib/paraglide/messages";

	interface Props {
		url: string;
	}

	const { url }: Props = $props();

	let container: HTMLDivElement | null = $state(null);
	let pdfSlick: PDFSlick | null = $state(null);
	let unsubscribe: () => void = () => {};

	/**
	 * We keep PDF Slick state portions of interest in reactive Svelte vars
	 */
	let pageNumber = $state(1);
	let numPages = $state(0);
	let scaleValue = $state<string | undefined>(undefined);

	const { stop: stopResizeObserver } = useResizeObserver(
		() => container,
		() => {
			if (scaleValue && ["page-width", "page-fit", "auto"].includes(scaleValue)) {
				pdfSlick!.viewer.currentScaleValue = scaleValue;
			}
		}
	);

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
		/**
		 * This is all happening on client side, so make sure we load it only there
		 */
		const { create, PDFSlick } = await import("@pdfslick/core");

		/**
		 * Create the PDF Slick store
		 */
		const store = create();

		pdfSlick = new PDFSlick({
			container: container!,
			store,
			options: {
				scaleValue: "page-fit",
			},
		});

		/**
		 * Load the PDF document
		 */
		pdfSlick.loadDocument(url);
		store.setState({ pdfSlick });

		/**
		 * We can subscribe to state changes, and keep values of interest as reactive Svelte vars,
		 * or alternatively we could hook these to a Svelte store
		 *
		 * Also keep reference of the unsubscribe function we call on component destroy
		 */
		unsubscribe = store.subscribe((s) => {
			pageNumber = s.pageNumber;
			numPages = s.numPages;
			scaleValue = s.scaleValue;
		});
	});

	onDestroy(() => {
		unsubscribe();
		stopResizeObserver();
		stopClickOutside();
	});

	const onGotoNext = () => pdfSlick?.gotoPage(Math.min(pageNumber + 1, numPages));
	const onGotoPrevious = () => pdfSlick?.gotoPage(Math.max(pageNumber - 1, 1));
	const zoomOut = () => pdfSlick?.decreaseScale();
	const zoomIn = () => pdfSlick?.increaseScale();
</script>

<div class="pdfSlick absolute inset-0 px-2 py-6" data-vaul-no-drag>
	<div class="relative h-full flex-1">
		<div class="pdfSlickContainer absolute inset-0 overflow-auto" bind:this={container}>
			<div id="viewer" class="pdfSlickViewer pdfViewer"></div>
		</div>
	</div>

	<div class="absolute bottom-0 right-0 z-50 mb-8 h-12 w-full">
		<div class="flex justify-center">
			<div class="flex gap-2 rounded-xl bg-muted/70 shadow-sm backdrop-blur-lg">
				<Button
					onclick={onGotoPrevious}
					size="icon"
					variant="ghost"
					disabled={pageNumber <= 1}
					type="button"
					class="group"
				>
					<span class="sr-only">Vorherige Seite</span>
					<ChevronLeft class="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
				</Button>
				<Button onclick={zoomOut} size="icon" variant="ghost" type="button" class="group">
					<span class="sr-only">verkleinern</span>
					<ZoomOut class="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
				</Button>
				<Button onclick={zoomIn} size="icon" variant="ghost" type="button" class="group">
					<span class="sr-only">vergrößern</span>
					<ZoomIn class="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
				</Button>
				<Button
					onclick={onGotoNext}
					size="icon"
					variant="ghost"
					disabled={pageNumber >= numPages}
					type="button"
					class="group"
				>
					<span class="sr-only">Nächste Seite</span>
					<ChevronRight class="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
				</Button>
			</div>
		</div>
	</div>
</div>
