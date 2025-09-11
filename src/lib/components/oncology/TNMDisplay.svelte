<script lang="ts">
	import { buttonVariants } from "$ui/button";
	import type { hoverMarker, TNMStaging } from "$lib/types/oncology_types";

	import CircleHelp from "@lucide/svelte/icons/circle-help";
	import X from "@lucide/svelte/icons/x";

	import * as Drawer from "$ui/drawer";
	import TnmExplainer from "./TNMExplainer.svelte";

	interface Props {
		staging: TNMStaging;
		type?: "clinical" | "pathological";
	}

	let { staging, type }: Props = $props();

	let hovered: hoverMarker | undefined = $state(undefined);
	const showColorForClassifications = false;

	const formatTNM = (tnm: TNMStaging): string => {
		let result = "";

		if (tnm.t !== undefined) {
			result += `${tnm.prefix?.t || ""}T${tnm.t}`;
			if (tnm.mSymbol !== undefined) result += `(${tnm.mSymbol})`;
		}

		if (tnm.n !== undefined) result += ` ${tnm.prefix?.n || ""}N${tnm.n}`;
		if (tnm.m !== undefined) result += ` ${tnm.prefix?.m || ""}M${tnm.m}`;
		if (tnm.l !== undefined) result += ` ${tnm.l}`;
		if (tnm.v !== undefined) result += ` ${tnm.v}`;
		if (tnm.pn !== undefined) result += ` ${tnm.pn}`;
		if (tnm.s !== undefined) result += ` ${tnm.s}`;

		return result;
	};

	const getLVPnDescription = (staging: TNMStaging): string[] => {
		const descriptions: string[] = [];

		if (staging.l) {
			const lDesc = {
				L0: "Keine Lymphgefäßinvasion",
				L1: "Lymphgefäßinvasion",
				LX: "Lymphgefäßinvasion kann nicht beurteilt werden",
			}[staging.l];
			if (lDesc) descriptions.push(lDesc);
		}

		if (staging.v) {
			const vDesc = {
				V0: "Keine Veneninvasion",
				V1: "Mikroskopische Veneninvasion",
				V2: "Makroskopische Veneninvasion",
				VX: "Veneninvasion kann nicht beurteilt werden",
			}[staging.v];
			if (vDesc) descriptions.push(vDesc);
		}

		if (staging.pn) {
			const pnDesc = {
				Pn0: "Keine Perineuralscheideninfiltration",
				Pn1: "Perineuralscheideninfiltration",
				PnX: "Perineuralscheideninfiltration kann nicht beurteilt werden",
			}[staging.pn];
			if (pnDesc) descriptions.push(pnDesc);
		}

		return descriptions;
	};

	// Helper function to format date
	function formatDate(date?: Date) {
		if (!date) return "Unbekannt";
		return new Intl.DateTimeFormat("de-DE", {
			year: "numeric",
			month: "long",
			day: "numeric",
		}).format(date);
	}
</script>

<div>
	<div class="flex flex-row items-baseline justify-start gap-2">
		<h3 class="font-xl mt-0">
			{type === "clinical"
				? "Klinische "
				: type === "pathological"
					? "Pathologische "
					: ""}TNM-Klassifikation
		</h3>
		{#if staging.date}
			<span class="text-muted-foreground">({formatDate(staging.date)})</span>
		{/if}
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
					<TnmExplainer {staging} bind:hovered />
				</Drawer.Content>
			</Drawer.Portal>
		</Drawer.NestedRoot>
	</div>
	{#if staging.version}
		<span class="text-muted-foreground hidden text-sm md:block">
			Version {staging.version}
		</span>
	{/if}
</div>

<div class="space-y-4">
	<!-- TNM Formula -->
	<div class="bg-muted rounded-md p-3">
		<div class="font-mono text-lg">{formatTNM(staging)}</div>
		{#if staging.uiccStage}
			<div class="text-muted-foreground mt-1 text-sm">
				UICC Stadium: {staging.uiccStage}
			</div>
		{/if}
	</div>

	<!-- Additional Markers -->
	<!-- {#if staging.l || staging.v || staging.pn}
			<div class="border-t pt-4">
				<h4 class="mb-2 text-sm font-medium text-foreground">Zusätzliche Marker</h4>
				<ul class="space-y-1">
					{#each getLVPnDescription(staging) as description}
						<li class="text-sm text-muted-foreground">• {description}</li>
					{/each}
				</ul>
			</div>
		{/if} -->
</div>
