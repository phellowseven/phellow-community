<script module lang="ts">
	export function getPageTitle(data: PageData) {
		return data.appointment.description ?? m.appointment();
	}
</script>

<script lang="ts">
	import type { PageData } from "./$types";
	import AppLayout from "../../_appLayout.svelte";

	import type { Location } from "fhir/r4";
	import { Map, TileLayer, Marker } from "sveaflet";

	import * as m from "$lib/paraglide/messages";

	import MapPin from "lucide-svelte/icons/map-pin";

	import AppointmentMetadataTable from "$components/appointments/AppointmentMetadataTable.svelte";
	import { browser } from "$app/environment";

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let appointment = $derived(data.appointment);

	async function resolveLocation(reference: string | undefined): Promise<Location | undefined> {
		return fetch(`/fhir/resolveReference?reference=${reference}`).then((response) =>
			response.ok ? (response.json() as Promise<Location>) : undefined
		);
	}
</script>

<svelte:head>
	<title>{appointment.description ?? m.appointment()}</title>
</svelte:head>

<AppLayout>
	{#snippet children()}
		{#if appointment.description}
			<h1>
				{appointment.description}
			</h1>
		{/if}

		<div class="flex flex-1 flex-col gap-4">
			<AppointmentMetadataTable {appointment} />

			<!-- Location -->
			{#await resolveLocation(appointment.participant.find( (p) => p.actor?.reference?.startsWith("Location/") )?.actor?.reference) then location}
				{#if location}
					<div
						class="flex flex-1 flex-col rounded-lg border border-sidebar-border bg-sidebar shadow"
					>
						<div class="inline-flex items-center gap-2 p-4 text-sm font-bold">
							<MapPin class="size-4 shrink-0" />
							{location.name}
						</div>
						{#if location.position && browser}
							<div id="map" class="clip z-0 min-h-[300px] flex-1 overflow-hidden rounded-b-lg">
								<Map
									options={{
										center: [location.position.latitude, location.position.longitude],
										zoom: 17,
									}}
								>
									<TileLayer url={"https://tile.openstreetmap.org/{z}/{x}/{y}.png"} />
									<Marker latLng={[location.position.latitude, location.position.longitude]} />
								</Map>
							</div>
						{/if}
					</div>
				{/if}
			{/await}
		</div>
	{/snippet}
</AppLayout>
