<script lang="ts">
	import type { Dayjs } from 'dayjs';
	import { Card, P } from 'flowbite-svelte';
	import { Calendar, Clock, Icon, MapPin } from 'svelte-hero-icons';
	import * as m from '$lib/paraglide/messages';

	export let title: string | undefined = undefined;
	export let duration: number | undefined = undefined;
	export let href: string | undefined = undefined;
	export let startDate: Dayjs | undefined = undefined;
	export let endDate: Dayjs | undefined = undefined;
	export let status:
		| 'proposed'
		| 'pending'
		| 'booked'
		| 'arrived'
		| 'fulfilled'
		| 'cancelled'
		| 'noshow'
		| 'entered-in-error'
		| 'checked-in'
		| 'waitlist'
		| undefined = undefined;

	export let locationReference: string | undefined = undefined;
	export let resolveLocationName: (reference: string | undefined) => Promise<string>;
	//
</script>

<Card horizontal={true} size="lg" class="w-full max-w-full" {href}>
	<div class="flex w-full flex-col justify-between sm:flex-row">
		<div class="sm:w-2/3">
			<P
				>{title}
				{#if status === 'cancelled'}
					<span>(Abgesagt)</span>
				{/if}
			</P>
			{#if locationReference}
				{#await resolveLocationName(locationReference) then locationName}
					<div class="mt-2 flex flex-row justify-start">
						<Icon src={MapPin} class="mr-2 h-6 w-6 shrink-0" />
						<span class="truncate text-wrap">{locationName}</span>
					</div>
				{/await}
			{/if}
		</div>
		<div class="flex flex-col items-start sm:w-1/3 sm:items-end">
			<div class="flex flex-row items-center">
				<div
					class="order-2 flex flex-col sm:order-1 {status === 'cancelled' ? 'line-through ' : ''}"
				>
					{#if startDate}
						<span>{startDate.format(m.appointment_dateTime_format())}</span>
					{/if}
					{#if endDate}
						{#if endDate.diff(startDate, 'days') > 0}
							<span>{endDate.format(m.appointment_dateTime_format())}</span>
						{/if}
					{/if}
				</div>
				<Icon src={Calendar} class="order-1 ml-0 mr-2 h-6 w-6 sm:order-2 sm:ml-2 sm:mr-0" />
			</div>
			{#if duration}
				<div class="mt-2 flex flex-row">
					<span class="order-2 sm:order-1 {status === 'cancelled' ? 'line-through ' : ''}"
						>{duration} min</span
					>
					<Icon src={Clock} class="order-1 ml-0 mr-2 h-6 w-6 sm:order-2 sm:ml-2 sm:mr-0" />
				</div>
			{/if}
		</div>
	</div>
</Card>
