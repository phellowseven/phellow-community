<script module lang="ts">
	import * as m from "$lib/paraglide/messages";

	import FileUp from "@lucide/svelte/icons/file-up";
	import { sheet } from "../sheet.svelte";

	export function getPageTitle() {
		return m.documents_title();
	}

	// On module level to survive navigation
	let search: string = $state("");

	const menuData = [
		[
			{
				label: m.document_upload_button(),
				icon: FileUp,
				onclick: () => {
					sheet.open = true;
				},
			},
		],
	];
</script>

<script lang="ts">
	import AppLayout from "../_appLayout.svelte";
	import type { PageData } from "./$types";

	import { sortBy } from "lodash-es";
	import dayjs from "dayjs";
	import type { DocumentReference } from "fhir/r4";
	import { encodeBase64url } from "@oslojs/encoding";

	import { route } from "$lib/ROUTES";

	import { headPageTitle } from "$lib/utils";
	import {
		documentTypeStringForDocumentReference,
		extractAuthorFullName,
		groupByMonth,
	} from "$lib/fhir/document";

	import { Button } from "$ui/button";
	import { Skeleton } from "$ui/skeleton";
	import * as Popover from "$ui/popover";
	import * as Sidebar from "$ui/sidebar";

	import Ellipsis from "@lucide/svelte/icons/ellipsis";

	import Searchbar from "$components/Searchbar.svelte";
	import Document from "$components/document/Document.svelte";
	import UploadDocumentSheet from "$components/sheets/UploadDocumentSheet.svelte";
	import NoContent from "$components/NoContent.svelte";
	import { localizeHref } from "$lib/paraglide/runtime";

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let menuOpen = $state(false);

	function filterBySearchTerm(documents: DocumentReference[]) {
		return sortBy(
			Object.entries(
				groupByMonth(
					documents.filter((document) => {
						if (search.length === 0) return true;
						return document.description?.toLowerCase().includes(search.toLowerCase());
					})
				)
			),
			([key]) => key
		).reverse();
	}
</script>

<svelte:head>
	<title>{headPageTitle(m.documents_title())}</title>
</svelte:head>

<AppLayout title={getPageTitle()}>
	{#snippet portal()}
		<UploadDocumentSheet validatedForm={data.uploadDocumentForm} />
	{/snippet}

	{#snippet stickyHeader()}
		<Button
			class="align-center hidden justify-center md:inline-flex "
			color="primary"
			onclick={() => (sheet.open = true)}
			><FileUp class="mr-2 size-4" />{m.document_upload_button()}</Button
		>
		<div class="md:hidden">
			<Popover.Root bind:open={menuOpen}>
				<Popover.Trigger>
					{#snippet child({ props })}
						<Button
							{...props}
							variant="ghost"
							size="icon"
							class="data-[state=open]:bg-accent size-7"
						>
							<Ellipsis />
						</Button>
					{/snippet}
				</Popover.Trigger>
				<Popover.Content class="w-56 overflow-hidden rounded-lg p-0" align="end">
					<Sidebar.Root collapsible="none" class="bg-transparent">
						<Sidebar.Content>
							{#each menuData as group, index (index)}
								<Sidebar.Group class="border-b last:border-none">
									<Sidebar.GroupContent class="gap-0">
										<Sidebar.Menu>
											{#each group as item, index (index)}
												<Sidebar.MenuItem>
													<Sidebar.MenuButton
														onclick={() => {
															menuOpen = false;
															item.onclick();
														}}
													>
														<item.icon /> <span>{item.label}</span>
													</Sidebar.MenuButton>
												</Sidebar.MenuItem>
											{/each}
										</Sidebar.Menu>
									</Sidebar.GroupContent>
								</Sidebar.Group>
							{/each}
						</Sidebar.Content>
					</Sidebar.Root>
				</Popover.Content>
			</Popover.Root>
		</div>
	{/snippet}

	{#snippet children()}
		<Searchbar bind:value={search} />

		<div class="flex flex-1 flex-col items-start space-y-4 md:space-y-8">
			{#await data.entries}
				{#each { length: 2 }}
					<Skeleton class="bg-secondary h-10 w-32 rounded-lg" />
					{#each { length: 3 }}
						<Skeleton class="h-20 w-full rounded-lg bg-white" />
					{/each}
				{/each}
			{:then entries}
				{@const filtered = filterBySearchTerm(entries)}
				{#if filtered.length === 0}
					<NoContent class="flex-1" />
				{:else}
					{#each filtered as [group, documents] (group)}
						{@const month = dayjs(group)}
						<section class="w-full" aria-describedby="month-grouping">
							<h2
								class="border-secondary-foreground bg-secondary text-secondary-foreground mb-2 inline-flex rounded-lg border p-2 text-lg font-bold md:mb-4"
								id="month-grouping"
							>
								<time datetime={month.format("YYYY-MM")}>
									{month.format(m.documents_group_header_date_format())}
								</time>
							</h2>
							<ul class="flex w-full flex-col space-y-2 md:space-y-4">
								{#each documents as document (document.id)}
									<li>
										<Document
											class="bg-card/70 hover:bg-card block rounded-lg px-4 py-2 shadow-sm hover:shadow-lg md:px-6 md:py-6"
											title={document.description}
											createdAt={document.date ? dayjs(document.date) : undefined}
											author={extractAuthorFullName(document) ?? undefined}
											type={documentTypeStringForDocumentReference(document)}
											href={document.id
												? localizeHref(
														route("/documents/[documentId]", {
															documentId: encodeBase64url(new TextEncoder().encode(document.id!)),
														})
													)
												: undefined}
										/>
									</li>
								{/each}
							</ul>
						</section>
					{/each}
				{/if}
			{/await}
		</div>
	{/snippet}
</AppLayout>
