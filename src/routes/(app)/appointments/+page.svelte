<script lang="ts" context="module">
	// This is a context="module" script, so that the search survives navigation.
	import { writable } from 'svelte/store';
	let search = writable<string>('');
</script>

<script lang="ts">
	import { pageTitle } from '$lib/util';
	import { P, Search } from 'flowbite-svelte';
	import { blur } from 'svelte/transition';
	import StickyHeader from '$components/StickyHeader.svelte';
	import type { PageData } from './$types';
	import Appointment from '$components/Appointments/Appointment.svelte';
	import type { Location } from 'fhir/r4';
	import dayjs from 'dayjs';
	import * as m from '$lib/paraglide/messages';
	import AppointmentPlaceholder from '$components/Appointments/AppointmentPlaceholder.svelte';
	import { sortBy } from 'lodash-es';
	import { groupByMonth } from '$components/Appointments';
	import GroupHeadingPlaceholder from '$components/Placeholder/GroupHeadingPlaceholder.svelte';

	export let data: PageData;

	$: groupedAppointments = data.entries.then((appointments) =>
		sortBy(
			Object.entries(
				groupByMonth(
					appointments.filter((appointment) => {
						if ($search.length === 0) return true;

						return appointment.description?.toLowerCase().includes($search.toLowerCase());
					})
				)
			),
			([key]) => key
		).reverse()
	);

	async function resolveLocationName(reference: string | undefined): Promise<string> {
		return fetch(`/fhir/resolveReference?reference=${reference}`)
			.then((response) => response.json() as Promise<Location>)
			.then((data) => data.name ?? 'Unknown location');
	}
</script>

<svelte:head>
	<title>{pageTitle(m.appointments_title())}</title>
</svelte:head>

<div in:blur={{ duration: 200 }} class="my-8">
	<StickyHeader>
		<div class="flex items-start justify-between lg:flex-row">
			<P class="text-3xl font-extrabold">{m.appointments_title()}</P>
		</div>
	</StickyHeader>

	<Search bind:value={$search} class="z-0 mb-4" placeholder={m.searchbar_placeholder()} />

	<div class="flex w-full flex-col items-start">
		{#await groupedAppointments}
			<GroupHeadingPlaceholder />
			<AppointmentPlaceholder />
		{:then entries}
			{#each entries as [group, appointments] (group)}
				<h2 class="mb-2 mt-8 rounded-lg bg-[#d0f5ec] p-2 text-lg font-bold text-[#109b77]">
					{dayjs(group).format(m.documents_group_header_date_format())}
				</h2>
				<ul class="flex w-full flex-col space-y-2">
					{#each appointments as appointment (appointment.id)}
						<li>
							<Appointment
								title={appointment.description}
								duration={appointment.minutesDuration}
								startDate={appointment.start ? dayjs(appointment.start) : undefined}
								endDate={appointment.end ? dayjs(appointment.end) : undefined}
								status={appointment.status}
								locationReference={appointment.participant.filter((p) =>
									p.actor?.reference?.startsWith('Location/')
								)[0]?.actor?.reference}
								{resolveLocationName}
							/>
						</li>
					{/each}
				</ul>
			{/each}
		{/await}
	</div>
</div>
