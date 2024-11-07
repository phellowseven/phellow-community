<script lang="ts">
	import { Icon, MagnifyingGlass, Funnel } from 'svelte-hero-icons';
	import type { PageData } from './$types';
	import * as m from '$lib/paraglide/messages';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import LabResultsTable from '$components/Observations/LabResultsTable.svelte';

	export let data: PageData;

	// Lab categories with their display names
	const LAB_CATEGORIES = {
		hematology: 'Blood Count',
		chemistry: 'Blood Chemistry',
		coagulation: 'Coagulation',
		immunology: 'Immunology',
		microbiology: 'Microbiology',
		urinalysis: 'Urinalysis',
		other: 'Other Tests'
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
		console.log('Sorting by:', sortField);
		if (filterState.sortBy === sortField) {
			// Toggle order if clicking the same field
			updateFilters({
				sortOrder: filterState.sortOrder === 'asc' ? 'desc' : 'asc'
			});
		} else {
			// Set new sort field with default desc order
			updateFilters({
				sortBy: sortField,
				sortOrder: 'desc'
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

<div class="container mx-auto my-8">
	<!-- Header -->
	<h1 class="mb-8 text-3xl font-bold text-gray-900">{m.structuredData_title()}</h1>

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
					placeholder="Search tests..."
					class="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500"
				/>
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
					<option value="all">All Categories</option>
					{#each Object.entries(LAB_CATEGORIES) as [value, label]}
						<option {value}>{label}</option>
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
				<label for="outOfRange" class="ml-2 text-sm text-gray-700"> Show Out of Range Only </label>
			</div>
		</div>
	</div>

	<!-- Results Table -->
	<LabResultsTable
		observations={data.entries}
		sortBy={filterState.sortBy}
		sortOrder={filterState.sortOrder}
		onSort={handleSort}
	/>
</div>
