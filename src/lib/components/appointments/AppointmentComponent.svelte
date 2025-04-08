<script lang="ts">
	import type { Dayjs } from "dayjs";
	import Calendar from "lucide-svelte/icons/calendar";
	import Clock from "lucide-svelte/icons/clock";
	import MapPin from "lucide-svelte/icons/map-pin";

	import * as m from "$lib/paraglide/messages";
	import { statusColor, statusText } from ".";
	import type { Appointment } from "fhir/r4";

	interface Props {
		title?: string | undefined;
		duration?: number | undefined;
		href?: string | undefined;
		class?: string;
		startDate?: Dayjs | undefined;
		endDate?: Dayjs | undefined;
		status: Appointment["status"];
		locationReference?: string | undefined;
		resolveLocationName: (reference: string | undefined) => Promise<string>;
	}

	let {
		status,
		title = undefined,
		duration = undefined,
		href = undefined,
		startDate = undefined,
		endDate = undefined,
		locationReference = undefined,
		class: classes,
		resolveLocationName,
	}: Props = $props();
</script>

<a {href} class={classes}>
	<div class="flex w-full flex-row items-center">
		<div class="sm:w-2/3">
			<p class="font-medium">
				{title}
				<span class={["rounded-full px-2 py-0.5 text-sm", statusColor(status)]}>
					{statusText(status)}
				</span>
			</p>
			{#if locationReference}
				{#await resolveLocationName(locationReference) then locationName}
					<div class="mt-2 flex flex-row justify-start text-muted-foreground">
						<MapPin class="mr-2 h-6 w-6 shrink-0" />
						<span class="truncate text-wrap">{locationName}</span>
					</div>
				{/await}
			{/if}
		</div>
		<div class="flex flex-col items-start text-muted-foreground sm:w-1/3 sm:items-end">
			<div class="flex flex-row items-center">
				<div
					class="order-2 flex flex-col sm:order-1 {status === 'cancelled' ? 'line-through ' : ''}"
				>
					{#if startDate}
						<time datetime={startDate?.format("YYYY-MM-DD")}
							>{startDate.format(m.appointment_dateTime_format())}</time
						>
					{/if}
					{#if endDate}
						{#if endDate.diff(startDate, "days") > 0}
							<time datetime={endDate?.format("YYYY-MM-DD")}
								>{endDate.format(m.appointment_dateTime_format())}</time
							>
						{/if}
					{/if}
				</div>
				<Calendar class="order-1 ml-0 mr-2 h-6 w-6 sm:order-2 sm:ml-2 sm:mr-0" />
			</div>
			{#if duration}
				<div class="mt-2 flex flex-row">
					<time
						datetime="{duration}m"
						class="order-2 sm:order-1 {status === 'cancelled' ? 'line-through ' : ''}"
						>{duration} min</time
					>
					<Clock class="order-1 ml-0 mr-2 h-6 w-6 sm:order-2 sm:ml-2 sm:mr-0" />
				</div>
			{/if}
		</div>
	</div>
</a>
