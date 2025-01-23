<!-- src/routes/structured/+page.svelte -->
<script lang="ts" module>
	export const pageTitle = m.structuredData_title();
</script>

<script lang="ts">
	import type { PageData } from "./$types";
	import AppLayout from "../_appLayout.svelte";

	import { goto } from "$app/navigation";
	import { page } from "$app/state";

	import * as m from "$lib/paraglide/messages";
	import { headPageTitle } from "$lib/utils";

	import * as Select from "$ui/select";
	import { Input } from "$ui/input";
	import { Checkbox } from "$ui/checkbox";
	import { Label } from "$ui/label";

	import Search from "lucide-svelte/icons/search";
	import Filter from "lucide-svelte/icons/filter";
	import XMark from "lucide-svelte/icons/x";

	import LabResultsTable from "$components/observations/LabResultsTable.svelte";

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	// Lab categories with their display names
	const LAB_CATEGORIES: Record<string, { code: string; display: () => string }> = {
		"social-history": { code: "social-history", display: () => m.lab_categories_socialHistory() },
		"vital-signs": { code: "vital-signs", display: () => m.lab_categories_vitalSigns() },
		imaging: { code: "imaging", display: () => m.lab_categories_imaging() },
		laboratory: { code: "laboratory", display: () => m.lab_categories_laboratory() },
		procedure: { code: "procedure", display: () => m.lab_categories_procedure() },
		survey: { code: "survey", display: () => m.lab_categories_survey() },
		exam: { code: "exam", display: () => m.lab_categories_exam() },
		therapy: { code: "therapy", display: () => m.lab_categories_therapy() },
		activity: { code: "activity", display: () => m.lab_categories_activity() },
	};

	const DEFAULT_SORT_ORDER: Record<string, "desc" | "asc"> = {
		date: "desc",
		name: "asc",
		value: "asc",
	};

	// Initialize filter state from URL parameters
	let filterState = $derived(data.filterParams);

	// Function to update URL and trigger navigation
	function updateFilters(updates: Partial<typeof filterState>) {
		const newState = { ...filterState, ...updates };
		const url = new URL(page.url);

		// Update URL parameters
		Object.entries(newState).forEach(([key, value]) => {
			if (value !== undefined && value !== null && value !== "") {
				url.searchParams.set(key, value.toString());
			} else {
				url.searchParams.delete(key);
			}
		});

		// Navigate to new URL (this will trigger a page reload with new filters)
		goto(url, { keepFocus: true });
	}

	// Function to handle sort changes
	function handleSort(sortField: typeof filterState.sortBy) {
		if (filterState.sortBy === sortField) {
			// Toggle order if clicking the same field
			updateFilters({
				sortOrder: filterState.sortOrder === "asc" ? "desc" : "asc",
			});
		} else {
			// Set new sort field with default order for sortField type
			updateFilters({
				sortBy: sortField,
				sortOrder: DEFAULT_SORT_ORDER[sortField] ?? "asc",
			});
		}
	}

	// Debounce function for search input
	function debounce(func: Function, wait: number) {
		let timeout: NodeJS.Timeout;
		return function executedFunction(...args: any[]) {
			const later = () => {
				clearTimeout(timeout);
				func(...args);
			};
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
		};
	}

	// Debounced search handler
	const handleSearch = debounce((value: string) => {
		updateFilters({ searchTerm: value });
	}, 300);
</script>

<svelte:head>
	<title>{headPageTitle(m.structuredData_title())}</title>
</svelte:head>

<AppLayout>
	{#snippet children()}
		<!-- Filters -->
		<div class="rounded-lg bg-card p-4 shadow">
			<div class="grid gap-4 lg:grid-cols-3">
				<!-- Search -->
				<div class="relative">
					<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
						<Search class="h-5 w-5 text-muted-foreground" />
					</div>
					<Input
						type="text"
						value={filterState.searchTerm}
						oninput={(e) => handleSearch(e.currentTarget.value)}
						placeholder={m.sturcturedData_search_type()}
						class="pl-10"
					/>
					{#if filterState.searchTerm}
						<button
							class="absolute inset-y-0 right-0 flex items-center pr-3"
							onclick={() => updateFilters({ searchTerm: undefined })}
						>
							<XMark class="h-5 w-5 text-muted-foreground" />
						</button>
					{/if}
				</div>

				<!-- Category Filter -->
				<div class="relative">
					<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
						<Filter class="h-5 w-5 text-muted-foreground" />
					</div>
					<Select.Root
						type="single"
						name="category"
						bind:value={filterState.category}
						onValueChange={(value) => updateFilters({ category: value })}
					>
						<Select.Trigger class="pl-10">
							{filterState.category
								? (LAB_CATEGORIES[filterState.category]?.display() ?? m.lab_categories_all())
								: m.lab_categories_all()}
						</Select.Trigger>
						<Select.Content>
							<Select.Group>
								<Select.GroupHeading>{m.lab_categories()}</Select.GroupHeading>
								<Select.Item value="all" label={m.lab_categories_all()}>
									{m.lab_categories_all()}
								</Select.Item>
								{#each Object.entries(LAB_CATEGORIES) as [_, obj]}
									<Select.Item value={obj.code} label={obj.display()}>
										{obj.display()}
									</Select.Item>
								{/each}
							</Select.Group>
						</Select.Content>
					</Select.Root>
				</div>

				<!-- Out of Range Filter -->
				<div class="flex items-center space-x-2">
					<Checkbox
						id="outOfRange"
						bind:checked={filterState.showOutOfRange}
						aria-labelledby="outOfRange-label"
						onCheckedChange={(checked) => updateFilters({ showOutOfRange: checked })}
					/>
					<Label id="outOfRange-label" for="outOfRange"
						>{m.structuredData_filter_outofrange()}</Label
					>
				</div>
			</div>
		</div>

		<!-- Results Table -->
		<LabResultsTable
			observations={data.entries}
			sortBy={filterState.sortBy}
			sortOrder={filterState.sortOrder}
			onSort={handleSort}
			onTypeSelect={(type) => updateFilters({ searchTerm: type })}
		/>
	{/snippet}
</AppLayout>
