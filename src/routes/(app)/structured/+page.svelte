<!-- src/routes/structured/+page.svelte -->
<script lang="ts">
	import { Icon, MagnifyingGlass, Funnel, XMark } from 'svelte-hero-icons';
	import type { PageData } from './$types';
	import * as m from '$lib/paraglide/messages';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import LabResultsTable from '$components/Observations/LabResultsTable.svelte';
	import { pageTitle } from '$lib/util';
	import StickyHeader from '$components/StickyHeader.svelte';
	import { P } from 'flowbite-svelte';
	import { blur } from 'svelte/transition';

	export let data: PageData;

	// Lab categories with their display names
	const LAB_CATEGORIES: Record<string, { code: string; display: () => string }> = {
		socialHistory: { code: 'social-history', display: () => m.lab_categories_socialHistory() },
		vitalSigns: { code: 'vital-signs', display: () => m.lab_categories_vitalSigns() },
		imaging: { code: 'imaging', display: () => m.lab_categories_imaging() },
		laboratory: { code: 'laboratory', display: () => m.lab_categories_laboratory() },
		procedure: { code: 'procedure', display: () => m.lab_categories_procedure() },
		survey: { code: 'survey', display: () => m.lab_categories_survey() },
		exam: { code: 'exam', display: () => m.lab_categories_exam() },
		therapy: { code: 'therapy', display: () => m.lab_categories_therapy() },
		activity: { code: 'activity', display: () => m.lab_categories_activity() }
	};

	const DEFAULT_SORT_ORDER: Record<string, 'desc' | 'asc'> = {
		date: 'desc',
		name: 'asc',
		value: 'asc'
	};

	// Initialize filter state from URL parameters
	$: filterState = data.filterParams;

	// Function to update URL and trigger navigation
	function updateFilters(updates: Partial<typeof filterState>) {
		const newState = { ...filterState, ...updates };
		const url = new URL($page.url);

		// Update URL parameters
		Object.entries(newState).forEach(([key, value]) => {
			if (value !== undefined && value !== null && value !== '') {
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
				sortOrder: filterState.sortOrder === 'asc' ? 'desc' : 'asc'
			});
		} else {
			// Set new sort field with default order for sortField type
			updateFilters({
				sortBy: sortField,
				sortOrder: DEFAULT_SORT_ORDER[sortField] ?? 'asc'
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
	<title>{pageTitle(m.structuredData_title())}</title>
</svelte:head>

<div in:blur={{ duration: 200 }} class="my-8">
	<!-- Header -->
	<StickyHeader>
		<div class="flex items-start justify-between lg:flex-row">
			<P class="text-3xl font-extrabold">{m.structuredData_title()}</P>
		</div>
	</StickyHeader>

	<!-- Filters -->
	<div class="mb-6 rounded-lg bg-white p-4 shadow">
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			<!-- Search -->
			<div class="relative">
				<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
					<Icon src={MagnifyingGlass} class="h-5 w-5 text-gray-400" />
				</div>
				<input
					type="text"
					value={filterState.searchTerm}
					on:input={(e) => handleSearch(e.currentTarget.value)}
					placeholder={m.sturcturedData_search_type()}
					class="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500"
				/>
				{#if filterState.searchTerm}
					<button
						class="absolute inset-y-0 right-0 flex items-center pr-3"
						on:click={() => updateFilters({ searchTerm: undefined })}
					>
						<Icon src={XMark} class="h-5 w-5 text-gray-400" />
					</button>
				{/if}
			</div>

			<!-- Category Filter -->
			<div class="relative">
				<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
					<Icon src={Funnel} class="h-5 w-5 text-gray-400" />
				</div>
				<select
					value={filterState.category}
					on:change={(e) => updateFilters({ category: e.currentTarget.value })}
					class="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500"
				>
					<option value="all">{m.lab_categories_all()}</option>
					{#each Object.entries(LAB_CATEGORIES) as [_, obj]}
						<option value={obj.code}>{obj.display()}</option>
					{/each}
				</select>
			</div>

			<!-- Out of Range Filter -->
			<div class="flex items-center">
				<input
					type="checkbox"
					checked={filterState.showOutOfRange}
					on:change={(e) => updateFilters({ showOutOfRange: e.currentTarget.checked })}
					id="outOfRange"
					class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
				/>
				<label for="outOfRange" class="ml-2 text-sm text-gray-700">
					{m.structuredData_filter_outofrange()}
				</label>
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
</div>
