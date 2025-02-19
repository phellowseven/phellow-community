<script lang="ts">
	import dayjs from "dayjs";
	import type { Appointment } from "fhir/r4";

	import { cn } from "$lib/utils";

	import * as m from "$lib/paraglide/messages";

	import { participantStatusColor, participantStatusText, statusColor, statusText } from ".";

	import * as Table from "$ui/table";

	import CircleCheck from "lucide-svelte/icons/circle-check";
	import CircleHelp from "lucide-svelte/icons/circle-help";
	import CircleX from "lucide-svelte/icons/circle-x";
	import Calendar from "lucide-svelte/icons/calendar";
	import Clock from "lucide-svelte/icons/clock";
	import MessageCircle from "lucide-svelte/icons/message-circle";
	import ListTodo from "lucide-svelte/icons/list-todo";
	import Shapes from "lucide-svelte/icons/shapes";
	import Users from "lucide-svelte/icons/users";

	interface Props {
		appointment: Appointment;
		class?: string;
	}

	let { appointment, class: classes }: Props = $props();

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

	function statusIcon(status: Appointment["status"]) {
		switch (status) {
			case "arrived":
			case "booked":
			case "checked-in":
			case "fulfilled":
				return CircleCheck;
			case "cancelled":
			case "entered-in-error":
			case "noshow":
				return CircleX;
			default:
				return CircleHelp;
		}
	}

	const StatusIcon = statusIcon(appointment.status);
</script>

<div class={cn("rounded-lg border border-sidebar-border bg-sidebar shadow", classes)}>
	<Table.Root>
		<Table.Body>
			<!-- Date & Time -->
			<Table.Row>
				<Table.Cell class="font-bold">
					<div class="flex items-center justify-start gap-2">
						<Calendar class="size-4" />
						{m.appointment_metadata_dateTime()}
					</div>
				</Table.Cell>
				<Table.Cell>{dateString}</Table.Cell>
			</Table.Row>
			<!-- Status -->
			<Table.Row>
				<Table.Cell class="font-bold">
					<div class="flex items-center justify-start gap-2">
						<StatusIcon class="size-4" />
						{m.appointment_metadata_status()}
					</div>
				</Table.Cell>
				<Table.Cell
					><span
						class={[
							"inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
							statusColor(appointment.status),
						]}
					>
						{statusText(appointment.status)}
					</span></Table.Cell
				>
			</Table.Row>
			<!-- Cancellation Reason -->
			{#if appointment.status === "cancelled" && appointment.cancelationReason}
				<Table.Row>
					<Table.Cell class="font-bold">{m.appointment_metadata_cancellation_reason()}</Table.Cell>
					<Table.Cell
						>{appointment.cancelationReason.coding?.[0]?.display ||
							m.appointment_metadata_cancellation_no_reason()}</Table.Cell
					>
				</Table.Row>
			{/if}
			<!-- Duration -->
			<Table.Row>
				<Table.Cell class="font-bold">
					<div class="flex items-center justify-start gap-2">
						<Clock class="size-4" />
						{m.appointment_metadata_duration()}
					</div>
				</Table.Cell>
				<Table.Cell
					>{m.appointment_metadata_duration_minutes({ duration: `${duration}` })}
				</Table.Cell>
			</Table.Row>
			<!-- Comment -->
			{#if appointment.comment}
				<Table.Row>
					<Table.Cell class="font-bold">
						<div class="flex items-center justify-start gap-2">
							<MessageCircle class="size-4" />
							{m.appointment_metadata_comment()}
						</div>
					</Table.Cell>
					<Table.Cell>{appointment.comment}</Table.Cell>
				</Table.Row>
			{/if}
			<!-- Instructions -->
			{#if appointment.patientInstruction}
				<Table.Row>
					<Table.Cell class="font-bold">
						<div class="flex items-center justify-start gap-2">
							<ListTodo class="size-4" />
							{m.appointment_metadata_patient_instructions()}
						</div>
					</Table.Cell>
					<Table.Cell>{appointment.patientInstruction}</Table.Cell>
				</Table.Row>
			{/if}
			<!-- Appointment Type -->
			{#if appointment.appointmentType}
				<Table.Row>
					<Table.Cell class="font-bold">
						<div class="flex items-center justify-start gap-2">
							<Shapes class="size-4" />
							{m.appointment_metadata_appointment_type()}
						</div>
					</Table.Cell>
					<Table.Cell>{appointment.appointmentType!.coding?.[0]?.display || m.unknown()}</Table.Cell
					>
				</Table.Row>
			{/if}
			<!-- Participants -->
			{#if displayedParticipants.length > 0}
				<Table.Row>
					<Table.Cell class="font-bold">
						<div class="flex items-center justify-start gap-2">
							<Users class="size-4" />
							{m.appointment_metadata_participants()}
						</div>
					</Table.Cell>
					<Table.Cell>
						<div class="grid gap-3">
							{#each displayedParticipants as participant}
								<div class="flex items-center justify-start gap-2">
									<div class="flex items-center gap-2">
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
										{participantStatusText(participant.status)}
									</span>
								</div>
							{/each}
						</div>
					</Table.Cell>
				</Table.Row>
			{/if}
		</Table.Body>
	</Table.Root>
</div>
