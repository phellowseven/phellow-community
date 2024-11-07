<!-- src/components/Observations/ObservationLineChart.svelte -->
<script lang="ts">
	import { VisXYContainer, VisLine, VisAxis } from '@unovis/svelte';
	import { CurveType, type LineConfigInterface } from '@unovis/ts';
	import type { Observation } from 'fhir/r4';
	import dayjs from 'dayjs';
	import * as m from '$lib/paraglide/messages';

	export let observations: Observation[];

	type Datum = {
		timestamp: number;
		date: Date;
		value: number | undefined;
		isOutOfRange: boolean;
		unit: string | undefined;
	};

	// Transform observations for charting
	$: chartData = observations
		.map(
			(obs) =>
				({
					timestamp: dayjs(obs.effectiveDateTime).valueOf(), // Convert to timestamp
					date: dayjs(obs.effectiveDateTime).toDate(),
					value: obs.valueQuantity?.value,
					isOutOfRange: isOutOfRange(obs),
					unit: obs.valueQuantity?.unit
				}) as Datum
		)
		.filter((d) => d.value !== undefined)
		.sort((a, b) => a.timestamp - b.timestamp);

	// Get reference range for visualization
	$: referenceRange = getReferenceRange(observations[0]);

	// Helper function to determine if a value is out of range
	function isOutOfRange(observation: Observation): boolean {
		const value = observation.valueQuantity?.value;
		const low = observation.referenceRange?.[0]?.low?.value;
		const high = observation.referenceRange?.[0]?.high?.value;

		if (value === undefined || (low === undefined && high === undefined)) return false;
		return (low !== undefined && value < low) || (high !== undefined && value > high);
	}

	// Get reference range from observation
	function getReferenceRange(observation: Observation) {
		if (!observation?.referenceRange?.[0]) return null;
		const range = observation.referenceRange[0];
		return {
			low: range.low?.value,
			high: range.high?.value
		};
	}

	// Chart configuration
	const xConfig = {
		tickFormat: (timestamp: number) => dayjs(timestamp).format('DD.MM.YYYY'),
		label: 'Date'
	};

	const yConfig = {
		tickFormat: (d: number) => d.toString(),
		label: observations[0].valueQuantity?.unit || ''
	};

	// Line styling based on reference range
	const lineConfig: LineConfigInterface<Datum> = {
		x: (d) => d.timestamp,
		y: (d) => d.value,
		color: () => '#3b82f6',
		curveType: CurveType.Linear,
		lineWidth: 2
	};

	// Reference range line configuration
	const refLineConfig: Omit<LineConfigInterface<Datum>, 'x' | 'y'> = {
		color: '#94a3b8',
		lineWidth: 1,
		lineDashArray: [5]
	};

	// Additional chart settings
	const containerConfig = {
		// height: '100%'
	};
</script>

{#if chartData.length > 0}
	<div class="min-h-80 w-full rounded-lg bg-white p-8 shadow">
		<!-- <h3 class="mb-4 text-lg font-semibold">
			{observations[0].code?.text ||
				observations[0].code?.coding?.[0]?.display ||
				m.observation_unknown()}
		</h3> -->
		<VisXYContainer
			data={chartData}
			xDomain={[
				chartData[0].timestamp - 86400000 * 30,
				chartData[chartData.length - 1].timestamp + 86400000 * 30
			]}
			{...containerConfig}
		>
			<!-- Reference range lines if available -->
			{#if referenceRange?.high !== undefined}
				<VisLine
					data={chartData}
					y={() => referenceRange.high}
					x={(d) => d.timestamp}
					{...refLineConfig}
				/>
			{/if}
			{#if referenceRange?.low !== undefined}
				<VisLine
					data={chartData}
					y={() => referenceRange.low}
					x={(d) => d.timestamp}
					{...refLineConfig}
				/>
			{/if}

			<!-- Main data line -->
			<VisLine data={chartData} {...lineConfig} />

			<!-- Axes -->
			<VisAxis type="x" {...xConfig} />
			<VisAxis type="y" {...yConfig} />
		</VisXYContainer>

		<!-- Legend -->
		<div class="mt-4 flex items-center gap-4 text-sm">
			{#if referenceRange}
				<div class="flex items-center gap-2">
					<div class="h-0.5 w-4 border border-dashed border-slate-400" />
					<span>{m.observation_reference_range()}</span>
				</div>
			{/if}
			<div class="flex items-center gap-2">
				<div class="h-2 w-2 rounded-full bg-blue-500" />
				<span>{m.observation_current_value()}</span>
			</div>
		</div>
	</div>
{:else}
	<p class="text-center text-gray-500">{m.observation_no_data()}</p>
{/if}
