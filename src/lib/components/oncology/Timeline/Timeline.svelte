<script lang="ts">
	import { compareAsc, differenceInCalendarDays, max } from "date-fns";

	import X from "@lucide/svelte/icons/x";

	import { Button, buttonVariants } from "$ui/button";
	import { Checkbox } from "$ui/checkbox";
	import * as Drawer from "$ui/drawer";
	import { Label } from "$ui/label";

	import TimelineBar from "./TimelineBar.svelte";
	import TimelineSpot from "./TimelineSpot.svelte";
	import { computeLanes, formatLegendDate, type Event } from "./timelineHelper";

	import type { Bundle } from "fhir/r4";
	import Diagnosis from "../MII/Details/Diagnosis/Diagnosis.svelte";
	import Radiation from "../MII/Details/Radiation/Radiation.svelte";
	import Surgery from "../MII/Details/Surgery/Surgery.svelte";
	import SystemicTherapy from "../MII/Details/SystemicTherapy/SystemicTherapy.svelte";
	import Progression from "../MII/Details/Progression/Progression.svelte";

	interface Props {
		events: Event[];
		bundle: Bundle;
	}

	let { events, bundle }: Props = $props();

	let compactView = $state(false);
	let showLegend = $state(true);
	let filterEmptyDates = $state(true);
	let selectedEvent: Event | undefined = $state(undefined);
	let stickyTitle = $state(false);
	let showJson = $state(false);
	let showFeedback = $state(false);
	function cancelFeedback() {
		showFeedback = false;
	}

	let showDrawer = $state(false);
	$effect(() => {
		if (selectedEvent) {
			showDrawer = true;
		} else {
			showDrawer = false;
		}
	});

	// Sort events by start date
	let sortedEvents = $derived([...events].sort((a, b) => compareAsc(a.startDate, b.startDate)));
	// Compute the lanes to handle overlapping events
	let lanes = $derived(computeLanes(sortedEvents));
	// Get the min and max dates for scaling
	let minDate = $derived(sortedEvents.length > 0 ? sortedEvents[0].startDate : new Date());
	let maxDate = $derived(
		sortedEvents.length > 0
			? max(sortedEvents.map((event) => event.endDate ?? event.startDate))
			: new Date()
	);
	// Calculate the total duration in milliseconds
	let totalDuration = $derived(differenceInCalendarDays(maxDate, minDate));

	// Generate an array of dates containing only the first of the month between minDate and maxDate
	let firstOfMonthDates = $derived.by(() => {
		var dates = [];
		let currentDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);

		while (currentDate <= maxDate) {
			dates.push(new Date(currentDate));
			currentDate.setMonth(currentDate.getMonth() + 1);
		}

		if (filterEmptyDates) {
			dates = dates.filter((date) =>
				sortedEvents.some(
					(event) =>
						(event.startDate.getFullYear() === date.getFullYear() &&
							event.startDate.getMonth() === date.getMonth()) ||
						(event.endDate &&
							event.endDate.getFullYear() === date.getFullYear() &&
							event.endDate.getMonth() === date.getMonth())
				)
			);
		}

		return dates;
	});
</script>

<div class="flex w-full flex-col items-center">
	<div class="mb-4 flex flex-row gap-6">
		<div class="flex items-center justify-center space-x-2">
			<Checkbox id="compact" name="compact" bind:checked={compactView}></Checkbox>
			<Label
				id="compact-label"
				for="compact"
				class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
			>
				Kompakte Ansicht
			</Label>
		</div>
		<div class="flex items-center justify-center space-x-2">
			<Checkbox id="legend" name="legend" bind:checked={showLegend}></Checkbox>
			<Label
				id="legend-label"
				for="legend"
				class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
			>
				Datum-Legende anzeigen
			</Label>
		</div>
		<div class="flex items-center justify-center space-x-2">
			<Checkbox id="filterEmptyDates" name="filterEmptyDates" bind:checked={filterEmptyDates}
			></Checkbox>
			<Label
				id="filterEmptyDates-label"
				for="filterEmptyDates"
				class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
			>
				"Leeres" Datum filtern
			</Label>
		</div>
		<div class="flex items-center justify-center space-x-2">
			<Checkbox id="stickyTitle" name="stickyTitle" bind:checked={stickyTitle}></Checkbox>
			<Label
				id="stickyTitle-label"
				for="stickyTitle"
				class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
			>
				Sticky Title
			</Label>
		</div>
	</div>
	<div
		style="--columns: {lanes.length}; --rows: {totalDuration}; --rowGap: {compactView
			? 0 + 'px'
			: 1 + 'px'}"
		class={["timeline-grid", showLegend ? "with-legend" : "without-legend"]}
	>
		{#if showLegend}
			<div
				class="bg-foreground h-full w-0.5"
				style="grid-column: 2/span 1;grid-row-start: {differenceInCalendarDays(
					firstOfMonthDates[0],
					minDate
				)}; grid-row-end: {totalDuration + 2}; justify-self: center;"
			></div>
			{#each firstOfMonthDates as monthDate}
				{@const rowStart = differenceInCalendarDays(monthDate, minDate) + 1}
				<div
					style="grid-column: 1/span 1;grid-row-start: {rowStart}; grid-row-end: {rowStart +
						1}; justify-self: end;"
				>
					<p>{formatLegendDate(monthDate)}</p>
				</div>
				<div
					class="bg-primary size-3 rounded-full"
					style="grid-column: 2/span 1;grid-row-start: {rowStart}; grid-row-end: {rowStart +
						1}; justify-self: center; align-self: center;"
				></div>
			{/each}
		{/if}

		{#each lanes as lane}
			{#each lane as event}
				{@const rowStart = differenceInCalendarDays(event.startDate, minDate) + 1}
				{@const rowEnd = event.endDate
					? differenceInCalendarDays(event.endDate, minDate)
					: rowStart + 1}
				{@const laneIndex = (event.lane ?? 0) + (showLegend ? 3 : 1)}

				{#if event.endDate}
					<TimelineBar
						{event}
						lane={laneIndex}
						{rowStart}
						{rowEnd}
						onclick={() => (selectedEvent = event)}
						{stickyTitle}
					/>
				{:else}
					<TimelineSpot
						{event}
						lane={laneIndex}
						{rowStart}
						{rowEnd}
						onclick={() => (selectedEvent = event)}
					/>
				{/if}
			{/each}
		{/each}
	</div>
</div>

<Drawer.Root bind:open={showDrawer} onClose={() => (showFeedback = false)}>
	<Drawer.Portal>
		<Drawer.Overlay class="bg-black/40" />
		{#if selectedEvent}
			{@const entry = bundle.entry?.find((e) => e.resource?.id === selectedEvent?.resourceId)}
			<Drawer.Content
				showDefaultOverlay={false}
				class="border-b-none border-border bg-card fixed right-0 bottom-0 left-0 -mx-px flex h-full max-h-[95%] flex-col rounded-t-[10px] border"
			>
				<div
					class="mx-auto flex w-full flex-col gap-8 overflow-y-auto p-2 px-4 pt-0 select-text md:p-4 md:px-8"
				>
					<Drawer.Header class="p-0">
						<div class="flex flex-row items-end justify-between">
							<Drawer.Title>
								<div class="flex flex-row gap-4">
									<div class="flex items-center justify-center space-x-2">
										<Checkbox id="showJson" name="showJson" bind:checked={showJson}></Checkbox>
										<Label
											id="showJson-label"
											for="showJson"
											class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
										>
											JSON anzeigen
										</Label>
									</div>
									{#if !showFeedback}
										<Button
											onclick={() => (showFeedback = true)}
											class={buttonVariants({ variant: "secondary" })}
										>
											Feedback zu diesem Datensatz geben
										</Button>
									{/if}
								</div>
							</Drawer.Title>
							<Drawer.Close class={[buttonVariants({ variant: "outline" }), "fixed top-8 right-8"]}>
								<X />
							</Drawer.Close>
						</div>
						<!-- <Drawer.Description class="space-y-2 text-justify">
							<p>
								{formatDateRange(
									selectedEvent.startDate,
									selectedEvent?.endDate ?? selectedEvent?.startDate
								)}
							</p>
						</Drawer.Description> -->
					</Drawer.Header>

					{#if selectedEvent.type === "diagnosis"}
						<Diagnosis />
					{:else if selectedEvent.type === "surgery"}
						<Surgery />
					{:else if selectedEvent.type === "radiation"}
						<Radiation />
					{:else if selectedEvent.type === "systemicTherapy"}
						<SystemicTherapy />
					{:else if selectedEvent.type === "progression"}
						<Progression />
					{/if}
					{#if showJson}
						<pre>{JSON.stringify(entry, null, 2)}</pre>
					{/if}
				</div>
			</Drawer.Content>
		{/if}
	</Drawer.Portal>
</Drawer.Root>

<style>
	.timeline-grid {
		display: grid;
		justify-content: center;
		column-gap: 8px;
		row-gap: var(--rowGap);
		grid-auto-rows: min-content;
	}

	.with-legend {
		grid-template-columns: minmax(64px, 1fr) 24px repeat(var(--columns), minmax(64px, 2fr));
	}

	.without-legend {
		grid-template-columns: repeat(var(--columns), minmax(64px, 1fr));
	}
</style>
