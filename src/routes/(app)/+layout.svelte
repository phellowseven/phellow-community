<script lang="ts">
	import type { LayoutData } from "./$types";

	import { onDestroy, onMount, type Snippet } from "svelte";
	import { goto } from "$app/navigation";

	import dayjs from "dayjs";

	import { sheet } from "./sheet.svelte";
	import { sidebar } from "./sidebar.svelte";

	import * as Sidebar from "$ui/sidebar";
	import { Separator } from "$ui/separator";

	import ChevronUp from "lucide-svelte/icons/chevron-up";

	import AppSidebar from "$components/AppSidebar.svelte";
	import ScrollToTop from "$components/ScrollToTop.svelte";
	// import Breadcrumb from "$components/Breadcrumb.svelte";

	interface Props {
		data: LayoutData;
		svelteHead?: Snippet;
		children: Snippet;
		stickyHeader?: Snippet;
	}

	let { data, children }: Props = $props();

	let sessionInterval: NodeJS.Timeout;

	onMount(() => {
		sessionInterval = setInterval(() => {
			if (dayjs(data.expiresAt).isBefore(dayjs())) {
				goto("/logout");
			}
		}, 1000);
	});

	onDestroy(() => {
		clearInterval(sessionInterval);
	});
</script>

<div class={["scroll-smooth transition-all", sheet.open ? "md:scale-[95%]" : ""]}>
	<Sidebar.Provider bind:open={sidebar.open} onOpenChange={(open) => (sidebar.open = open)}>
		<AppSidebar user={data.user} scopes={data.scopes} />
		<main class="m-4 flex w-full flex-col md:mx-6">
			<div
				class={[
					"sticky top-4 z-10 flex items-center rounded-lg border border-sidebar-border bg-sidebar py-6 shadow transition-all ease-linear md:top-2 md:-mr-4 md:-mt-2",
					sidebar.open ? "md:-ml-6" : "md:-ml-4",
				]}
			>
				<Sidebar.Trigger class="ml-4 size-10" />
				<Separator orientation="vertical" class="mx-2 self-stretch" />
				<!-- Disable for now until hmr issue is resolved: -->
				<!-- https://github.com/diericx/svelte-breadcrumbs/issues/17 -->
				<!-- <Breadcrumb /> -->
			</div>
			<div class={["flex flex-1 flex-col", sidebar.open ? "md:-ml-2" : undefined]}>
				{@render children?.()}
			</div>
			<ScrollToTop class="size-10">
				{#snippet children()}
					<span class="sr-only">Back to top</span>
					<ChevronUp class="size-4" />
				{/snippet}
			</ScrollToTop>
		</main>
	</Sidebar.Provider>
</div>
