<script module lang="ts">
	export function getPageTitle(data: PageData) {
		return data.appointment.description ?? m.appointment();
	}
</script>

<script lang="ts">
	import type { PageData } from "./$types";
	import AppLayout from "../../_appLayout.svelte";

	import dayjs from "dayjs";
	import type { Appointment, Location } from "fhir/r4";
	import { Map, TileLayer, Marker } from "sveaflet";

	import * as m from "$lib/paraglide/messages";

	import { Label } from "$ui/label";

	import Calendar from "lucide-svelte/icons/calendar";
	import CircleCheck from "lucide-svelte/icons/circle-check";
	import CircleHelp from "lucide-svelte/icons/circle-help";
	import Clock from "lucide-svelte/icons/clock";
	import InfoRow from "$components/InfoRow.svelte";
	import ListTodo from "lucide-svelte/icons/list-todo";
	import MapPin from "lucide-svelte/icons/map-pin";
	import Shapes from "lucide-svelte/icons/shapes";
	import Users from "lucide-svelte/icons/users";

	import { participantStatusColor, statusColor, statusText } from "$components/appointments";
	import AppointmentMetadataTable from "$components/appointments/AppointmentMetadataTable.svelte";

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let appointment = $derived(data.appointment);

	let isRange = $derived(appointment.start && appointment.end);
	let startDate = $derived(appointment.start ? dayjs(appointment.start) : undefined);
	let endDate = $derived(appointment.end ? dayjs(appointment.end) : undefined);
	let duration = $derived(appointment.minutesDuration ?? endDate?.diff(startDate, "minutes"));
	let dateIsSameDay = $derived(startDate && endDate && startDate.isSame(endDate, "day"));
	let dateString = $derived.by(() => {
		if (isRange) {
			if (dateIsSameDay) {
				return `${startDate!.format("L LT")} - ${endDate!.format("LT")}`;
			} else {
				return `${startDate!.format("L LT")} - ${endDate!.format("L LT")}`;
			}
		} else if (startDate) {
			return startDate.format("L LT");
		}
		return undefined;
	});
	let displayedParticipants = $derived.by(() => {
		return appointment.participant.filter((p) => {
			const ref = p.actor?.reference;
			if (ref === undefined) return false;
			return (
				ref.startsWith("Patient/") ||
				ref.startsWith("Practitioner/") ||
				ref.startsWith("PractitionerRole/") ||
				ref.startsWith("CareTeam/") ||
				ref.startsWith("RelatedPerson/") ||
				ref.startsWith("Group/")
			);
		});
	});

	async function resolveLocation(reference: string | undefined): Promise<Location | undefined> {
		return fetch(`/fhir/resolveReference?reference=${reference}`).then((response) =>
			response.ok ? (response.json() as Promise<Location>) : undefined
		);
	}

	function statusIcon(status: Appointment["status"]) {
		switch (status) {
			case "arrived":
			case "booked":
			case "checked-in":
			case "fulfilled":
				return CircleCheck;
			default:
				return CircleHelp;
		}
	}

	const StatusIcon = statusIcon(data.appointment.status);
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
						{#if location.position}
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
