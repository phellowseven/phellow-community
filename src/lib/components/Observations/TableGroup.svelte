<script lang="ts">
	import type { Observation } from 'fhir/r4';
	import dayjs from 'dayjs';
	import * as m from '$lib/paraglide/messages';
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	export let title: string;
	export let observations: Observation[];

	function compareDates(a: Observation, b: Observation) {
		return new Date(a.effectiveDateTime!).getTime() > new Date(b.effectiveDateTime!).getTime()
			? -1
			: 1;
	}

	let hidden = false;
</script>

<div class="mb-2 mt-8 flex flex-row items-end gap-2">
	<h2 class="rounded-lg bg-[#d0f5ec] p-2 text-lg font-bold text-[#109b77]">
		{title}
	</h2>
	<button
		on:click={() => (hidden = !hidden)}
		type="button"
		class="shrink rounded bg-gray-300 px-2 py-1 text-sm font-semibold text-white shadow-sm hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300"
		>{hidden ? m.observation_group_show() : m.observation_group_hide()}</button
	>
</div>
{#if !hidden}
	<table
		class="min-w-full divide-y divide-gray-300 pr-24"
		transition:slide={{ delay: 100, duration: 200, easing: quintOut, axis: 'y' }}
	>
		<thead>
			<tr>
				<th
					scope="col"
					class="py-3.5 pl-4 pr-3 text-right text-sm font-semibold text-gray-900 sm:pl-3"
					>{m.observation_table_header_value()}</th
				>
				<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
					>{m.observation_table_header_unit()}</th
				>
				<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
					>{m.observation_table_header_date()}</th
				>
			</tr>
		</thead>
		<tbody class="bg-white">
			{#each observations.sort((a, b) => compareDates(a, b)) as observation (observation.id)}
				<tr class="even:bg-gray-50">
					<td
						class="whitespace-nowrap py-4 pl-4 pr-3 text-right font-mono text-sm font-medium text-gray-900 sm:pl-3"
					>
						{observation.valueQuantity?.value}
					</td>
					<td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
						{observation.valueQuantity?.unit}
					</td>
					<td class="whitespace-nowrap px-3 py-4 font-mono text-sm text-gray-500">
						{dayjs(observation.effectiveDateTime).format(m.observations_table_date_format())}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
