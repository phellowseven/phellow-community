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
		<div class="flex flex-1 flex-col gap-4 rounded-lg border border-border bg-card p-4 shadow">
			<!-- DateTime -->
			<InfoRow id="dateTime" value={dateString}>
				{#snippet labelChild(id)}
					<div class="inline-flex items-center gap-2">
						<Calendar class="size-4" />
						<Label {id}>Datum & Uhrzeit</Label>
					</div>
				{/snippet}
			</InfoRow>

			<!-- Status -->
			<InfoRow id="status">
				{#snippet labelChild(id)}
					<div class="inline-flex items-center gap-2">
						<StatusIcon class="size-4" />
						<Label {id}>Status</Label>
					</div>
				{/snippet}
				{#snippet valueChild(id)}
					<span
						{id}
						class={[
							"inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
							statusColor(appointment.status),
						]}
					>
						{statusText(appointment.status)}
					</span>
				{/snippet}
			</InfoRow>

			<!-- Cancellation Reason -->
			{#if appointment.status === "cancelled" && appointment.cancelationReason}
				<InfoRow
					id="cancelationReason"
					label="Grund der Absage"
					value={appointment.cancelationReason.coding?.[0]?.display || "Kein Grund angegeben"}
				/>
			{/if}

			<!-- Duration -->
			<InfoRow id="duration" value={`${duration} Minuten`}>
				{#snippet labelChild(id)}
					<div class="inline-flex items-center gap-2">
						<Clock class="size-4" />
						<Label {id}>Dauer</Label>
					</div>
				{/snippet}
			</InfoRow>

			<!-- Comment -->
			{#if appointment.comment}
				<InfoRow id="comment" label="Kommentar" value={appointment.comment} />
			{/if}

			<!-- Instructions -->
			{#if appointment.patientInstruction}
				<InfoRow id="instructions" value={appointment.patientInstruction}>
					{#snippet labelChild(id)}
						<div class="inline-flex items-center gap-2">
							<ListTodo class="size-4" />
							<Label {id}>Instruktionen</Label>
						</div>
					{/snippet}
				</InfoRow>
			{/if}

			<!-- Appointment Type -->
			{#if appointment.appointmentType}
				<InfoRow
					id="appointmentType"
					value={appointment.appointmentType!.coding?.[0]?.display || "Unbekannt"}
				>
					{#snippet labelChild(id)}
						<div class="inline-flex items-center sm:gap-2">
							<Shapes class="size-4" />
							<Label {id}>Terminart</Label>
						</div>
					{/snippet}
				</InfoRow>
			{/if}

			{#if displayedParticipants.length > 0}
				<InfoRow id="participants">
					{#snippet labelChild(id)}
						<div class="inline-flex items-center gap-2">
							<Users class="mt-0.5 size-4" />
							<Label {id}>Teilnehmende</Label>
						</div>
					{/snippet}
					{#snippet valueChild(id)}
						<div class="grid gap-3" {id}>
							{#each displayedParticipants as participant}
								<div class="flex items-center justify-between rounded-lg bg-muted p-3">
									<div class="flex items-center gap-3">
										<span>
											{participant.actor?.display || participant.actor?.reference}
										</span>
										{#if participant.required}
											<span>({participant.required})</span>
										{/if}
									</div>
									<span
										class={[
											"inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
											participantStatusColor(participant.status),
										]}
									>
										{participant.status}
									</span>
								</div>
							{/each}
						</div>
					{/snippet}
				</InfoRow>
			{/if}

			<!-- Location -->
			{#await resolveLocation(appointment.participant.find( (p) => p.actor?.reference?.startsWith("Location/") )?.actor?.reference) then locationName}
				{#if locationName}
					<div class="inline-flex justify-start gap-2">
						<MapPin class="size-4 shrink-0" />
						<Label id="map">{locationName.name}</Label>
					</div>
					{#if locationName.position}
						<div id="map" class="clip z-0 min-h-[300px] flex-1 overflow-hidden rounded-md">
							<Map
								options={{
									center: [locationName.position.latitude, locationName.position.longitude],
									zoom: 17,
								}}
							>
								<TileLayer url={"https://tile.openstreetmap.org/{z}/{x}/{y}.png"} />
								<Marker
									latLng={[locationName.position.latitude, locationName.position.longitude]}
								/>
							</Map>
						</div>
					{/if}
				{/if}
			{/await}
		</div>
	{/snippet}
</AppLayout>
