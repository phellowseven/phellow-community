<script lang="ts">
	import type { Observation } from "fhir/r4";
	import dayjs from "dayjs";

	import * as m from "$lib/paraglide/messages";

	import XMark from "lucide-svelte/icons/x";

	interface Props {
		observation: Observation | null;
		onClose: () => void;
	}

	let { observation, onClose }: Props = $props();

	// Helper function to determine if a value is out of range
	function isOutOfRange(observation: Observation | null): boolean {
		if (!observation) return false;
		const value = observation.valueQuantity?.value;
		const low = observation.referenceRange?.[0]?.low?.value;
		const high = observation.referenceRange?.[0]?.high?.value;

		if (value === undefined || (low === undefined && high === undefined)) return false;
		return (low !== undefined && value < low) || (high !== undefined && value > high);
	}

	// Format the date with time
	function formatDateTime(date: string): string {
		return dayjs(date).format("L LT");
	}

	// Get the status display text
	function getStatusDisplay(status: string): string {
		const statusMap: Record<string, string> = {
			registered: m.observation_status_registered(),
			preliminary: m.observation_status_preliminary(),
			final: m.observation_status_final(),
			amended: m.observation_status_amended(),
			corrected: m.observation_status_corrected(),
			cancelled: m.observation_status_cancelled(),
			"entered-in-error": m.observation_status_error(),
			unknown: m.observation_status_unknown(),
		};
		return statusMap[status] || status;
	}

	// Close modal on escape key
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Escape") {
			onClose();
		}
	}

	let outOfRange = $derived(isOutOfRange(observation));
</script>

<svelte:window onkeydown={handleKeydown} />

{#if observation}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		role="dialog"
		class="fixed inset-0 z-50 !mt-0 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black bg-opacity-50"
		onclick={onClose}
	>
		<div class="relative mx-4 w-full max-w-2xl rounded-lg bg-card p-6 shadow-xl">
			<!-- Close button -->
			<button class="absolute right-4 top-4 hover:text-muted-foreground" onclick={onClose}>
				<XMark class="h-6 w-6" />
			</button>

			<!-- Header -->
			<h2 class="mt-0">
				{observation.code?.text ||
					observation.code?.coding?.[0]?.display ||
					m.observation_unknown()}
			</h2>

			<!-- Content -->
			<div class="space-y-4">
				<!-- Value -->
				<div class="rounded-lg bg-muted p-4">
					<h3 class="mt-0">{m.observation_current_value()}</h3>
					<p class={["", outOfRange ? "text-red-600" : undefined]}>
						{observation.valueQuantity?.value}
						{observation.valueQuantity?.unit}
					</p>
					{#if outOfRange}
						<p class="mt-1 text-sm text-red-600">{m.observation_out_of_range()}</p>
					{/if}
				</div>

				<!-- Reference Range -->
				{#if observation.referenceRange?.[0]}
					<div class="rounded-lg bg-muted p-4">
						<h3 class="mt-0">{m.observation_reference_range()}</h3>
						<p>
							{#if observation.referenceRange[0].low?.value && observation.referenceRange[0].high?.value}
								{observation.referenceRange[0].low.value} - {observation.referenceRange[0].high
									.value}
								{observation.valueQuantity?.unit}
							{:else if observation.referenceRange[0].high?.value}
								≤ {observation.referenceRange[0].high.value} {observation.valueQuantity?.unit}
							{:else if observation.referenceRange[0].low?.value}
								≥ {observation.referenceRange[0].low.value} {observation.valueQuantity?.unit}
							{/if}
						</p>
					</div>
				{/if}

				<!-- Additional Details -->
				<div class="grid gap-4 md:grid-cols-2">
					<!-- Status -->
					<div class="rounded-lg bg-muted p-4">
						<h3 class="mt-0">{m.observation_status()}</h3>
						<p>{getStatusDisplay(observation.status || "unknown")}</p>
					</div>

					<!-- Date/Time -->
					<div class="rounded-lg bg-muted p-4">
						<h3 class="mt-0">{m.observation_datetime()}</h3>
						<p>{formatDateTime(observation.effectiveDateTime || "")}</p>
					</div>
				</div>

				<!-- Notes -->
				{#if observation.note?.length}
					<div class="rounded-lg bg-muted p-4">
						<h3 class="mt-0">{m.observation_notes()}</h3>
						{#each observation.note as note}
							<p class="text-sm">{note.text}</p>
						{/each}
					</div>
				{/if}

				<!-- Method -->
				{#if observation.method?.coding?.[0]?.display}
					<div class="rounded-lg bg-muted p-4">
						<h3 class="mt-0">{m.observation_method()}</h3>
						<p>{observation.method.coding[0].display}</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
