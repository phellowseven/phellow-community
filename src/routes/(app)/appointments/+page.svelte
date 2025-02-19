<script lang="ts" module>
	export function getPageTitle() {
		return m.appointments_title();
	}

	// On module level to survive navigation
	let search: string = $state("");
</script>

<script lang="ts">
	import type { PageData } from "./$types";
	import AppLayout from "../_appLayout.svelte";

	import { sortBy } from "lodash-es";
	import dayjs from "dayjs";
	import type { Location, Appointment } from "fhir/r4";
	import { encodeBase64url } from "@oslojs/encoding";

	import { route } from "$lib/ROUTES";

	import { headPageTitle } from "$lib/utils";
	import * as m from "$lib/paraglide/messages";

	import { Skeleton } from "$ui/skeleton";

	import AppointmentComponent from "$components/appointments/AppointmentComponent.svelte";
	import { groupByMonth } from "$components/appointments";
	import Searchbar from "$components/Searchbar.svelte";
	import NoContent from "$components/NoContent.svelte";

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	function filterBySearchTerm(appointments: Appointment[]) {
		return sortBy(
			Object.entries(
				groupByMonth(
					appointments.filter((appointment) => {
						if (search.length === 0) return true;

						return appointment.description?.toLowerCase().includes(search.toLowerCase());
					})
				)
			),
			([key]) => key
		).reverse();
	}

	async function resolveLocationName(reference: string | undefined): Promise<string> {
		return fetch(`/fhir/resolveReference?reference=${reference}`)
			.then((response) => response.json() as Promise<Location>)
			.then((data) => data.name ?? "Unbekannter Ort");
	}
</script>

<svelte:head>
	<title>{headPageTitle(m.appointments_title())}</title>
</svelte:head>

<AppLayout title={getPageTitle()}>
	{#snippet children()}
		<Searchbar bind:value={search} class="" />

		<div class="flex flex-1 flex-col items-start space-y-4 md:space-y-8">
			{#await data.entries}
				{#each { length: 2 }}
					<Skeleton class="h-10 w-32 rounded-lg bg-secondary" />
					{#each { length: 3 }}
						<Skeleton class="h-20 w-full rounded-lg bg-white" />
					{/each}
				{/each}
			{:then entries}
				{@const filtered = filterBySearchTerm(entries)}

				{#if filtered.length === 0}
					<NoContent class="w-full flex-1" />
				{:else}
					{#each filtered as [group, appointments] (group)}
						{@const month = dayjs(group)}
						<section class="w-full" aria-describedby="month-grouping">
							<h2
								class="mb-2 inline-flex rounded-lg border border-secondary-foreground bg-secondary p-2 text-lg font-bold text-secondary-foreground md:mb-4"
								id="month-grouping"
							>
								<time datetime={month.format("YYYY-MM")}>
									{month.format(m.documents_group_header_date_format())}
								</time>
							</h2>
							<ul class="flex w-full flex-col space-y-2 md:space-y-4">
								{#each appointments as appointment (appointment.id)}
									<li>
										<AppointmentComponent
											class="block rounded-lg bg-card/70 px-4 py-2 shadow hover:bg-card hover:shadow-lg md:px-6 md:py-6"
											title={appointment.description}
											duration={appointment.minutesDuration}
											startDate={appointment.start ? dayjs(appointment.start) : undefined}
											endDate={appointment.end ? dayjs(appointment.end) : undefined}
											status={appointment.status}
											locationReference={appointment.participant.filter((p) =>
												p.actor?.reference?.startsWith("Location/")
											)[0]?.actor?.reference}
											{resolveLocationName}
											href={appointment.id
												? route("/appointments/[appointmentId]", {
														appointmentId: encodeBase64url(
															new TextEncoder().encode(appointment.id!)
														),
													})
												: undefined}
										/>
									</li>
								{/each}
							</ul>
						</section>
					{/each}
				{/if}
			{/await}
		</div>
	{/snippet}
</AppLayout>
