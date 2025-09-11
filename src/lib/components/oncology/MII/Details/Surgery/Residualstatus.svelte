<script lang="ts">
	import type { Observation } from "fhir/r4";
	import Calendar from "@lucide/svelte/icons/calendar";
	import CheckCircle from "@lucide/svelte/icons/check-circle";
	import Activity from "@lucide/svelte/icons/activity";
	import AlertCircle from "@lucide/svelte/icons/alert-circle";
	import Info from "@lucide/svelte/icons/info";
	import X from "@lucide/svelte/icons/x";
	import CircleHelp from "@lucide/svelte/icons/circle-help";

	import * as Drawer from "$ui/drawer";
	import { buttonVariants } from "$components/ui/button";

	interface Props {
		class?: string;
	}

	let { class: classes }: Props = $props();

	const example: Observation = {
		resourceType: "Observation",
		id: "mii-exa-onko-residualstatus-1",
		meta: {
			profile: [
				"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/StructureDefinition/mii-pr-onko-residualstatus",
			],
		},
		valueCodeableConcept: {
			coding: [
				{
					system:
						"https://www.medizininformatik-initiative.de/fhir/ext/modul-onko/CodeSystem/mii-cs-onko-residualstatus",
					code: "R0",
				},
			],
		},
		status: "final",
		code: {
			coding: [
				{
					code: "84892-9",
					system: "http://loinc.org",
				},
			],
		},
		subject: {
			reference: "Patient/example",
		},
		effectiveDateTime: "2024-02-08",
	};

	// Helper function to format date
	function formatDate(dateString?: string) {
		if (!dateString) return "Unbekannt";
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("de-DE", {
			year: "numeric",
			month: "long",
			day: "numeric",
		}).format(date);
	}

	// Helper function to get residual status information
	function getResidualStatus() {
		const statusCoding = example.valueCodeableConcept?.coding?.[0];
		if (!statusCoding) return { code: "Unbekannt", display: "Nicht dokumentiert", color: "gray" };

		const code = statusCoding.code || "Unbekannt";

		// Map residual status codes to descriptions and colors
		const statusMap: Record<string, { display: string; color: string }> = {
			R0: {
				display: "R0 - Kein Residualtumor",
				color: "green",
			},
			R1: {
				display: "R1 - Mikroskopischer Residualtumor",
				color: "yellow",
			},
			R2: {
				display: "R2 - Makroskopischer Residualtumor",
				color: "red",
			},
			RX: {
				display: "RX - Vorhandensein von Residualtumor kann nicht beurteilt werden",
				color: "gray",
			},
		};

		const display = statusCoding.display || statusMap[code]?.display || code;
		const color = statusMap[code]?.color || "gray";

		return { code, display, color };
	}

	// Get data for display
	const residualStatus = getResidualStatus();
	const assessmentDate = formatDate(example.effectiveDateTime);
	const observationStatus =
		example.status === "final"
			? "Final (bestätigt)"
			: example.status === "preliminary"
				? "Vorläufig"
				: example.status || "Unbekannt";
</script>

<div class={["grid grid-cols-1 gap-8", classes]}>
	<!-- Residual Status Card -->
	<div class="border-border bg-card rounded-lg border p-4 shadow-xs">
		<div class="mb-4 flex items-center justify-between">
			<div class="flex flex-col items-baseline gap-4 md:flex-row">
				<h3 class="mt-0 font-medium">Residualstatus</h3>
				<Drawer.NestedRoot>
					<!-- snapPoints={[0.25, 0.5, 0.75, 1]} bind:activeSnapPoint -->
					<Drawer.Trigger class={buttonVariants({ variant: "ghost", size: "sm" })}>
						<CircleHelp /> <span class="underline">Was bedeutet das?</span>
					</Drawer.Trigger>
					<Drawer.Portal>
						<Drawer.Overlay class="bg-black/40" />
						<Drawer.Content
							showDefaultOverlay={false}
							class="border-b-none border-border bg-card fixed right-0 bottom-0 left-0 -mx-px flex max-h-[97%] flex-col rounded-t-[10px] border"
						>
							<div class="mx-auto flex w-full flex-col overflow-y-auto p-4 pt-0 select-text">
								<Drawer.Header>
									<div class="flex flex-row items-end justify-between">
										<Drawer.Title>Was bedeutet der Residualstatus?</Drawer.Title>
										<Drawer.Close class={buttonVariants({ variant: "outline" })}><X /></Drawer.Close
										>
									</div>
									<Drawer.Description class="space-y-2 text-justify">
										Der Residualstatus beschreibt, ob nach einer Tumoroperation noch Tumorreste im
										Körper verblieben sind:
										<ul class="mt-2 space-y-1 text-sm">
											<li class="flex items-start gap-1">
												<span class="mt-1 inline-block size-2 rounded-full bg-green-500"></span>
												<span
													><strong>R0:</strong> Kein Tumorgewebe verblieben (vollständige Entfernung)</span
												>
											</li>
											<li class="flex items-start gap-1">
												<span class="mt-1 inline-block size-2 rounded-full bg-amber-500"></span>
												<span><strong>R1:</strong> Mikroskopisch kleine Tumorreste verblieben</span>
											</li>
											<li class="flex items-start gap-1">
												<span class="mt-1 inline-block size-2 rounded-full bg-red-500"></span>
												<span><strong>R2:</strong> Sichtbare Tumorreste verblieben</span>
											</li>
											<li class="flex items-start gap-1">
												<span class="mt-1 inline-block size-2 rounded-full bg-gray-500"></span>
												<span><strong>RX:</strong> Nicht beurteilbar</span>
											</li>
										</ul>
									</Drawer.Description>
								</Drawer.Header>
							</div>
						</Drawer.Content>
					</Drawer.Portal>
				</Drawer.NestedRoot>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div class="flex items-start gap-2">
				{#if residualStatus.color === "green"}
					<CheckCircle class="mt-0.5 shrink-0 text-green-600" size={16} />
				{:else if residualStatus.color === "yellow"}
					<AlertCircle class="mt-0.5 shrink-0 text-amber-600" size={16} />
				{:else if residualStatus.color === "red"}
					<AlertCircle class="mt-0.5 shrink-0 text-red-600" size={16} />
				{:else}
					<Info class="mt-0.5 shrink-0 text-gray-600" size={16} />
				{/if}
				<div>
					<div class="font-medium">Befund</div>
					<div class="text-muted-foreground">{residualStatus.display}</div>
				</div>
			</div>

			<div class="flex items-start gap-2">
				<Calendar class="mt-0.5 shrink-0" size={16} />
				<div>
					<div class="font-medium">Beurteilungsdatum</div>
					<div class="text-muted-foreground">{assessmentDate}</div>
				</div>
			</div>

			<div class="flex items-start gap-2 md:col-span-2">
				<Activity class="mt-0.5 shrink-0" size={16} />
				<div>
					<div class="font-medium">Status</div>
					<div class="text-muted-foreground">{observationStatus}</div>
				</div>
			</div>
		</div>
	</div>
</div>
