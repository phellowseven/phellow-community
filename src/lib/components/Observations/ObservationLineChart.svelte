<!-- src/components/Observations/ObservationLineChart.svelte -->
<script lang="ts">
	import {
		VisXYContainer,
		VisLine,
		VisAxis,
		VisCrosshair,
		VisScatter,
		VisTooltip,
		VisBrush
	} from '@unovis/svelte';
	import { CurveType, type LineConfigInterface, type ScatterConfigInterface } from '@unovis/ts';
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

	let brushMin: number | undefined;
	let brushMax: number | undefined;

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
	$: minObsValue = observations.reduce(
		(min, obs) => ((obs.valueQuantity?.value || 0) < min ? obs.valueQuantity?.value || 0 : min),
		Infinity
	);
	$: maxObsValue = observations.reduce(
		(max, obs) => ((obs.valueQuantity?.value || 0) > max ? obs.valueQuantity?.value || 0 : max),
		-Infinity
	);
	$: minValue = Math.min(referenceRange?.low || minObsValue, minObsValue);
	$: maxValue = Math.max(referenceRange?.high || maxObsValue, maxObsValue);
	$: diff = maxValue - minValue;
	$: yDomainMin = minValue - diff * 0.1;
	$: yDomainMax = maxValue + diff * 0.1;
	$: xDomainDiff = chartData[chartData.length - 1].timestamp - chartData[0].timestamp;
	$: xDomainMinBrush = chartData[0].timestamp - xDomainDiff * 0.025;
	$: xDomainMaxBrush = chartData[chartData.length - 1].timestamp + xDomainDiff * 0.025;
	$: xDomainMin = Math.max(chartData[0].timestamp - xDomainDiff * 0.025, brushMin ?? -Infinity);
	$: xDomainMax = Math.min(
		chartData[chartData.length - 1].timestamp + xDomainDiff * 0.025,
		brushMax ?? Infinity
	);

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

	function onBrush(selection: [number, number]) {
		[brushMin, brushMax] = selection;
	}

	// Chart configuration
	const xConfig = {
		tickFormat: (timestamp: number) => dayjs(timestamp).format('DD.MM.YYYY')
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

	// Config for scatter points
	const scatterConfig: ScatterConfigInterface<Datum> = {
		x: (d) => d.timestamp,
		y: (d) => d.value,
		color: (d) => (d.isOutOfRange ? 'rgb(224 36 36)' : '#3b82f6')
	};

	// Reference range line configuration
	const refLineConfig: Omit<LineConfigInterface<Datum>, 'x' | 'y'> = {
		color: '#94a3b8',
		lineWidth: 2,
		lineDashArray: [5]
	};

	// Additional chart settings
	const containerConfig = {};

	// Tooltip template
	const template = (d: Datum) =>
		`${d.isOutOfRange ? "<span class='font-bold text-red-600'>" : '<span>'}${d.value} ${d.unit}</span></br><span>${new Date(d.timestamp).toLocaleDateString()}</span>`;
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
			xDomain={[xDomainMin, xDomainMax]}
			yDomain={[yDomainMin, yDomainMax]}
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
			<VisScatter data={chartData} {...scatterConfig} size={() => 5} />

			<!-- Axes -->
			<VisAxis type="x" {...xConfig} label="Date" />
			<VisAxis type="y" {...yConfig} label={observations[0].valueQuantity?.unit || ''} />
			<VisCrosshair x={lineConfig.x} y={lineConfig.y} color={() => '#15ce9e'} {template} />
			<VisTooltip />
		</VisXYContainer>

		<div class="mb-4 mt-8">
			<VisXYContainer
				data={chartData}
				xDomain={[xDomainMinBrush, xDomainMaxBrush]}
				yDomain={[yDomainMin, yDomainMax]}
				height={75}
			>
				<VisLine data={chartData} {...lineConfig} />
				<VisScatter data={chartData} {...scatterConfig} size={() => 5} />
				<VisAxis
					type="x"
					{...xConfig}
					label="Die Griffe links & rechts bewegen, um den Wertebereich einzuschränken."
				/>
				<VisAxis type="y" {...yConfig} label=" " />
				<VisBrush {onBrush} draggable={true} />
			</VisXYContainer>
		</div>

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
