<script lang="ts">
	import { stopPropagation, createBubbler } from "svelte/legacy";

	const bubble = createBubbler();
	import ArrowDown from "lucide-svelte/icons/arrow-down";
	import ArrowUp from "lucide-svelte/icons/arrow-up";
	import Minus from "lucide-svelte/icons/minus";
	import ChevronUp from "lucide-svelte/icons/chevron-up";
	import ChevronDown from "lucide-svelte/icons/chevron-down";
	import CircleHelp from "lucide-svelte/icons/circle-help";
	import Chart from "lucide-svelte/icons/chart-column";

	import type { Observation } from "fhir/r4";
	import dayjs from "dayjs";
	import * as m from "$lib/paraglide/messages";
	import ObservationDetailModal from "./ObservationDetailModal.svelte";
	import { encodeBase64url } from "@oslojs/encoding";
	import { route } from "$lib/ROUTES";

	interface Props {
		observations: Observation[];
		sortBy: "date" | "name" | "value" | "range" | "trend" | "graph";
		sortOrder: "asc" | "desc";
		onSort: (field: typeof sortBy) => void;
		onTypeSelect: (type: string) => void;
		isInteractive?: boolean;
	}

	let {
		observations,
		sortBy,
		sortOrder,
		onSort,
		onTypeSelect,
		isInteractive = true,
	}: Props = $props();

	// Add state for selected observation
	let selectedObservation: Observation | null = $state(null);

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
		return dayjs(date).format("L");
	}

	// Function to get the trend indicator
	function getTrend(current: number, previous: number | undefined): "up" | "down" | "stable" {
		if (!previous) return "stable";
		const diff = ((current - previous) / previous) * 100;
		if (Math.abs(diff) < 5) return "stable";
		return diff > 0 ? "up" : "down";
	}

	// Function to handle row click
	function handleRowClick(observation: Observation) {
		selectedObservation = observation;
	}

	// Sortable column configuration
	const columns = [
		{ id: "name" as const, sortable: true, label: m.comp_obs_labresulttable_column_name() },
		{ id: "value" as const, sortable: true, label: m.comp_obs_labresulttable_column_value() },
		{ id: "range" as const, sortable: false, label: m.comp_obs_labresulttable_column_range() }, // Not sortable
		{ id: "date" as const, sortable: true, label: m.comp_obs_labresulttable_column_date() },
		{
			id: "trend" as const,
			sortable: false,
			label: m.comp_obs_labresulttable_column_trend(),
			tooltip: m.comp_obs_labresulttable_trend_tooltip(),
		}, // Not sortable
		{ id: "graph" as const, sortable: false, label: "Graph" },
	];
</script>

<!-- Add modal component -->
<ObservationDetailModal
	observation={selectedObservation}
	onClose={() => (selectedObservation = null)}
/>

<div class="overflow-x-auto rounded-lg bg-card shadow">
	<table class="min-w-full divide-y divide-border">
		<thead class="bg-primary/70">
			<tr>
				{#each columns as column (column.label)}
					{#if isInteractive || (!isInteractive && column.id !== "graph")}
						<th
							class={[
								"select-none px-6 py-3 text-left text-xs font-medium uppercase tracking-wider",
								column.sortable && isInteractive ? "cursor-pointer hover:bg-primary" : undefined,
							]}
							onclick={() => isInteractive && column.sortable && onSort(column.id)}
						>
							<span class="inline-flex items-center" title={column.tooltip && column.tooltip}>
								{#if column.tooltip}
									<CircleHelp class="mr-1 inline-block h-4 w-4 cursor-pointer" />
								{/if}
								{column.label}
								{#if column.sortable && column.id === sortBy}
									{#if sortOrder === "asc"}
										<ChevronUp class="ml-1 inline-block h-4 w-4" />
									{:else}
										<ChevronDown class="ml-1 inline-block h-4 w-4" />
									{/if}
								{/if}
							</span>
						</th>
					{/if}
				{/each}
			</tr>
		</thead>
		<tbody class="divide-y divide-border bg-card/70">
			{#each observations as observation}
				{@const outOfRange = isOutOfRange(observation)}
				{@const value = observation.valueQuantity?.value}
				{@const unit = observation.valueQuantity?.unit}
				{@const previousValue = observations
					.filter((obs) => obs.code?.coding?.[0]?.code === observation.code?.coding?.[0]?.code)
					.filter((obs) =>
						dayjs(obs.effectiveDateTime || "").isBefore(observation.effectiveDateTime || "")
					)
					.sort((a, b) =>
						dayjs(a.effectiveDateTime || "").isAfter(b.effectiveDateTime || "") ? -1 : 1
					)[0]?.valueQuantity?.value}
				{@const trend = getTrend(value || 0, previousValue)}
				{@const range = observation.referenceRange?.[0]}
				{@const displayText = observation.code?.text || observation.code?.coding?.[0]?.display}
				{@const code = observation.code?.coding?.find((c) => c.system === "http://loinc.org")?.code}

				<tr
					class={[
						"cursor-pointer",
						outOfRange
							? "bg-red-50 hover:bg-red-100 dark:bg-red-900 hover:dark:bg-red-800"
							: "hover:bg-muted",
					]}
					onclick={() => handleRowClick(observation)}
				>
					<td class="px-6 py-4 text-sm">
						<button
							type="button"
							onclick={stopPropagation(() => onTypeSelect(displayText ?? ""))}
							title={m.comp_obs_labresulttable_typeEntry_tooltip()}
							class="hover:underline">{displayText}</button
						>
					</td>
					<td class="px-6 py-4 text-sm">
						{#if value}
							<span class={outOfRange ? "font-bold text-red-600 dark:text-foreground" : ""}>
								{value}
								{unit}
							</span>
						{:else}
							–
						{/if}
					</td>
					<td class="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
						{#if range}
							{#if range.high?.value && range.low?.value}
								{range.low?.value} - {range.high?.value}
								{unit}
							{:else if range.high?.value}
								&leq; {range.high?.value}
								{unit}
							{:else if range.low?.value}
								&GreaterEqual; {range.low?.value}
								{unit}
							{/if}
						{/if}
					</td>
					<td class="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
						{formatDate(observation.effectiveDateTime || "")}
					</td>
					<td class="whitespace-nowrap px-6 py-4 text-sm">
						{#if trend === "up"}
							<ArrowUp class="h-5 w-5 text-red-500 dark:text-red-400" />
						{:else if trend === "down"}
							<ArrowDown class="h-5 w-5 text-green-500" />
						{:else}
							<Minus class="h-5 w-5 text-muted-foreground" />
						{/if}
					</td>
					{#if isInteractive}
						<td class="whitespace-nowrap px-6 py-4 text-sm">
							{#if code}
								<a
									href={route("/labs/[coding]", {
										coding: encodeBase64url(new TextEncoder().encode(code)),
									})}
									onclick={stopPropagation(bubble("click"))}
								>
									<Chart class="h-5 w-5 " /></a
								>
							{/if}
						</td>
					{/if}
				</tr>
			{:else}
				<tr>
					<td colspan="6" class="px-6 py-4 text-center text-sm text-muted-foreground">
						{m.comp_obs_labresulttable_noresults()}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
