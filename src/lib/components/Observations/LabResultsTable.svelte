<script lang="ts">
	import {
		Icon,
		ArrowDown,
		ArrowUp,
		Minus,
		ChevronUp,
		ChevronDown,
		QuestionMarkCircle
	} from 'svelte-hero-icons';
	import type { Observation } from 'fhir/r4';
	import dayjs from 'dayjs';
	import * as m from '$lib/paraglide/messages';

	export let observations: Observation[];
	export let sortBy: 'date' | 'name' | 'value';
	export let sortOrder: 'asc' | 'desc';
	export let onSort: (field: typeof sortBy) => void;

	// Function to determine if a value is out of range
	function isOutOfRange(observation: Observation): boolean {
		const value = observation.valueQuantity?.value;
		const low = observation.referenceRange?.[0]?.low?.value;
		const high = observation.referenceRange?.[0]?.high?.value;

		if (value === undefined || (low === undefined && high === undefined)) return false;
		return (low !== undefined && value < low) || (high !== undefined && value > high);
	}

	// Function to format the date
	function formatDate(date: string): string {
		return new Date(date).toLocaleDateString();
	}

	// Function to get the trend indicator
	function getTrend(current: number, previous: number | undefined): 'up' | 'down' | 'stable' {
		if (!previous) return 'stable';
		const diff = ((current - previous) / previous) * 100;
		if (Math.abs(diff) < 5) return 'stable';
		return diff > 0 ? 'up' : 'down';
	}

	// Sortable column configuration
	const columns = [
		{ id: 'name' as const, label: () => m.comp_obs_labresulttable_column_name() },
		{ id: 'value' as const, label: () => m.comp_obs_labresulttable_column_value() },
		{ label: () => m.comp_obs_labresulttable_column_range() }, // Not sortable
		{ id: 'date' as const, label: () => m.comp_obs_labresulttable_column_date() },
		{
			label: () => m.comp_obs_labresulttable_column_trend(),
			tooltip: () => m.comp_obs_labresulttable_trend_tooltip()
		} // Not sortable
	];
</script>

<div class="overflow-x-auto rounded-lg bg-white shadow">
	<table class="min-w-full divide-y divide-gray-200">
		<thead class="bg-gray-300">
			<tr>
				{#each columns as column (column.label)}
					<th
						class="px-6 py-3 text-left text-xs font-medium tracking-wider text-white
				{column.id ? 'cursor-pointer hover:bg-gray-200' : ''} 
				select-none uppercase"
						on:click={() => column.id && onSort(column.id)}
					>
						<span class="inline-flex items-center" title={column.tooltip && column.tooltip()}>
							{#if column.tooltip}
								<Icon
									src={QuestionMarkCircle}
									solid
									class="mr-1 inline-block h-4 w-4 cursor-pointer"
								/>
							{/if}
							{column.label()}
							{#if column.id && column.id === sortBy}
								{#if sortOrder === 'asc'}
									<Icon src={ChevronUp} class="ml-1 inline-block h-4 w-4" />
								{:else}
									<Icon src={ChevronDown} class="ml-1 inline-block h-4 w-4" />
								{/if}
							{/if}
						</span>
					</th>
				{/each}
			</tr>
		</thead>
		<tbody class="divide-y divide-gray-200 bg-white">
			{#each observations as observation}
				{@const outOfRange = isOutOfRange(observation)}
				{@const value = observation.valueQuantity?.value}
				{@const unit = observation.valueQuantity?.unit}
				{@const previousValue = observations
					.filter((obs) => obs.code?.coding?.[0]?.code === observation.code?.coding?.[0]?.code)
					.filter((obs) =>
						dayjs(obs.effectiveDateTime || '').isBefore(observation.effectiveDateTime || '')
					)
					.sort((a, b) =>
						dayjs(a.effectiveDateTime || '').isAfter(b.effectiveDateTime || '') ? -1 : 1
					)[0]?.valueQuantity?.value}
				{@const trend = getTrend(value || 0, previousValue)}
				{@const range = observation.referenceRange?.[0]}

				<tr class={outOfRange ? 'bg-red-50' : ''}>
					<td class="px-6 py-4 text-sm text-gray-900">
						{observation.code?.text || observation.code?.coding?.[0]?.display}
					</td>
					<td class="px-6 py-4 text-sm">
						{#if value}
							<span class={outOfRange ? 'font-bold text-red-600' : 'text-gray-900'}>
								{value}
								{unit}
							</span>
						{:else}
							–
						{/if}
					</td>
					<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
						{#if range}
							{#if range.high?.value && range.low?.value}
								{range.low?.value} - {range.high?.value}
								{unit}
							{:else if range.high?.value}
								<!-- else content here -->
								&leq; {range.high?.value}
								{unit}
							{:else if range.low?.value}
								<!-- else content here -->
								&GreaterEqual; {range.low?.value}
								{unit}
							{/if}
						{/if}
					</td>
					<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
						{formatDate(observation.effectiveDateTime || '')}
					</td>
					<td class="whitespace-nowrap px-6 py-4 text-sm">
						{#if trend === 'up'}
							<Icon src={ArrowUp} class="h-5 w-5 text-red-500" />
						{:else if trend === 'down'}
							<Icon src={ArrowDown} class="h-5 w-5 text-green-500" />
						{:else}
							<Icon src={Minus} class="h-5 w-5 text-gray-400" />
						{/if}
					</td>
				</tr>
			{:else}
				<tr>
					<td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">
						{m.comp_obs_labresulttable_noresults()}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
