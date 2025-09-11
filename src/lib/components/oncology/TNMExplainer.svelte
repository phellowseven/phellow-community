<script lang="ts">
	import type { TNMStaging, TNMPrefix, hoverMarker } from "$lib/types/oncology_types";
	import X from "@lucide/svelte/icons/x";
	import { buttonVariants } from "$ui/button";
	import * as Drawer from "$ui/drawer";

	interface Props {
		staging: TNMStaging;
		class?: string;
		hovered?: hoverMarker;
	}

	let { staging, class: classes, hovered = $bindable() }: Props = $props();

	const showColorForClassifications = false;

	function explainPrefix(prefix: TNMPrefix): string {
		switch (prefix) {
			case "c":
				return "Die Beschreibung beruht auf den vor einer Behandlung erhobenen Ergebnissen der körperlichen Untersuchung und bildgebenden Verfahren.";
			case "p":
				return 'Das p von "pathologisch" verwenden Ärztinnen und Ärzte, wenn sie bei der Einteilung die Ergebnisse der feingeweblichen Untersuchung von entnommenen Proben oder eines entfernten Tumors berücksichtigen. Diese Untersuchungen führen Fachleute für Pathologie durch.';
			case "y":
				return "Dies bedeutet, dass die Einteilung während oder nach einer Behandlung erfolgt. Wichtig ist: Sie beschreibt den aktuellen Zustand zum Zeitpunkt der Untersuchung, nicht den Zustand vor Behandlungsbeginn.";
			case "r":
				return 'Das kleine r von "rezidiv" steht für einen Tumor, der sich nach einer tumorfreien Zeit gebildet hat.';
			case "a":
				return "Ein vorangestelltes kleines a verwenden Fachleute, wenn sie die Krebserkrankung festgestellt haben, als sie den Körper einer verstorbenen Person untersucht haben.";
			default:
				return prefix;
		}
	}

	function explainT(t: string): string {
		switch (t.toLowerCase()) {
			case "0":
				return "Es wurde kein Primärtumor gefunden.";
			case "x":
				return "Der Tumor kann zu diesem Zeitpunkt nicht beurteilt werden.";
			case "is":
				return 'is steht für "in situ". Die Angabe Tis oder auch CIS (carcinoma in situ) beschreibt eine Krebsfrühform, beispielsweise einen kleinen bösartigen Tumor, der sich noch nicht in angrenzende Strukturen ausgebreitet hat.';
			case "1":
				return "Der Tumor ist kleiner als 2 cm.";
			case "1a":
				return "Der Tumor hat eine Größe von 0,5 cm oder weniger.";
			case "1b":
				return "Der Tumor hat eine Größe zwischen 0,5 cm und 1 cm.";
			case "1c":
				return "Der Tumor hat eine Größe zwischen 1 cm und 2 cm.";
			case "2":
				return "Der Tumor ist zwischen 2 und 5 cm groß.";
			case "3":
				return "Der Tumor ist größer als 5 cm.";
			case "4":
				return "Der Tumor hat sich in angrenzende Organe ausgebreitet.";

			default:
				return t;
		}
	}
	function explainN(n: string): string {
		switch (n.toLowerCase()) {
			case "0":
				return "Kein Lymphknotenbefall.";
			case "1":
				return "Der Tumor hat sich in die nächstgelegenen Lymphknoten ausgebreitet und ist verschieblich.";
			case "2a":
				return "Der Tumor hat sich in die nächstgelegenen Lymphknoten ausgebreitet und ist nicht verschieblich.";
			case "2b":
				return "Der Tumor hat einen Lymphknoten an der A. thoracica interna befallen.";
			case "3":
				return "Der Tumor hat einen infra- oder supraklavikulären Lymphknoten befallen.";
			default:
				return n;
		}
	}
	function explainM(m: string): string {
		switch (m.toLowerCase()) {
			case "0":
				return "Es sind aktuell keine Fernmetastasen vorhanden.";
			case "1":
				return "Es sind Fernmetastasen vorhanden.";
			default:
				return m;
		}
	}
	function explainL(l: string): string {
		switch (l.toLowerCase()) {
			case "l0":
				return "Die Lymphgefäße sind krebsfrei.";
			case "l1":
				return "In den Lymphgefäßen gibt es Krebszellen.";
			case "lx":
				return "Es kann nicht beurteilt werden, ob in den Lymphgefäßen Krebszellen vorhanden sind.";
			default:
				return l;
		}
	}
	function explainV(v: string): string {
		switch (v.toLowerCase()) {
			case "v0":
				return "Die Gefäßwände der Venen sind krebsfrei.";
			case "v1":
				return "In den Gefäßwänden sind unter dem Mikroskop Krebszellen sichtbar.";
			case "v2":
				return "Es gibt mit dem bloßen Auge erkennbare (makroskopische) Ansammlungen von Krebszellen in den Gefäßwänden.";
			case "vx":
				return "Ob Krebszellen in den Gefäßwänden der Venen vorhanden sind kann nicht beurteilt werden.";
			default:
				return v;
		}
	}
	function explainPn(pn: string): string {
		switch (pn.toLowerCase()) {
			case "pn0":
				return "Das Gewebe um die Nervenzellen enthält keine Krebszellen.";
			case "pn1":
				return "Im die Nervenzellen umgebenden Gewebe sind Krebszellen vorhanden.";
			case "pnx":
				return "Es kann nicht beurteilt werden, ob Krebszellen im Gewebe um die Nervenzellen vorhanden sind.";
			default:
				return pn;
		}
	}
	function explainS(s: string): string {
		switch (s.toLowerCase()) {
			case "s0":
				return "Serumtumormarker im Normbereich.";
			case "s1":
			case "s2":
			case "s3":
				return "Serumtumormarker erhöht.";
			case "sx":
				return "Nicht verfügbar/nicht untersucht.";
			default:
				return s;
		}
	}
</script>

<div class="mx-auto flex w-full flex-col overflow-y-auto p-4 pt-0 select-text">
	<Drawer.Header>
		<div class="flex flex-row items-end justify-between">
			<Drawer.Title>Die TNM-Klassifikation erklärt</Drawer.Title>
			<Drawer.Close class={buttonVariants({ variant: "outline" })}><X /></Drawer.Close>
		</div>
		<Drawer.Description class="space-y-2 text-justify">
			<p>
				auch: TNM-System oder TNM-Kategorie;<br />Ein international gültiges System zur Beschreibung
				(Klassifikation) der Größe und Ausbreitung bösartiger Tumoren.
			</p>
			{#if staging.t}
				<div
					class={[
						"px-1",
						showColorForClassifications ? "text-[#4A8D8D]" : undefined,
						hovered === "t" ? "rounded-sm bg-[#4A8D8D33]" : "",
					]}
				>
					<b>T</b> steht für Tumor. Es beschreibt wie groß der Tumor ist und ob und wie er sich in angrenzende
					Organe und Strukturen ausgebreitet hat.
				</div>
			{/if}
			{#if staging.n}
				<div
					class={[
						"px-1",
						showColorForClassifications ? "text-[#5B6C9D]" : undefined,
						hovered === "n" ? "rounded-sm bg-[#5B6C9D33]" : "",
					]}
				>
					<b>N</b> steht für Lymphknoten (englisch Node). Es beschreibt, ob der Tumor in den in seiner
					Nähe liegenden Lymphknoten Metastasen gebildet hat.
				</div>
			{/if}
			{#if staging.m}
				<div
					class={[
						"px-1",
						showColorForClassifications ? "text-[#6D8057]" : undefined,
						hovered === "m" ? "rounded-sm bg-[#6D805733]" : "",
					]}
				>
					<b>M</b> steht für Metastasen. Es beschreibt, ob sich in vom Tumor entfernten Körperbereichen
					Metastasen gebildet haben.
				</div>
			{/if}
			{#if staging.l}
				<div
					class={[
						"px-1",
						showColorForClassifications ? "text-[#B0A8B9]" : undefined,
						hovered === "l" ? "rounded-sm bg-[#B0A8B933]" : "",
					]}
				>
					<b>L</b> steht für Lymphgefäßinvasion. Es beschreibt, ob in Tumornähe gelegene Gefäße des Lymphsystems
					Krebszellen enthalten.
				</div>
			{/if}
			{#if staging.v}
				<div
					class={[
						"px-1",
						showColorForClassifications ? "text-[#9D7D6B]" : undefined,
						hovered === "v" ? "rounded-sm bg-[#9D7D6B33]" : "",
					]}
				>
					<b>V</b> beschreibt, ob es Krebszellen in den Wänden der den Tumor umgebenen Blutgefäße gibt.
					V steht dabei für "Vene", also für Gefäße, die das Blut zum Herzen zurück transportieren.
				</div>
			{/if}
			{#if staging.pn}
				<div
					class={[
						"px-1",
						showColorForClassifications ? "text-[#7F8FA6]" : undefined,
						hovered === "pn" ? "rounded-sm bg-[#7F8FA633]" : "",
					]}
				>
					<b>Pn</b> steht für perineural. Die Nervenbahnen sind von einer Hülle umgeben – den sogenannten
					Nervenscheiden (Perineurium). Pn beschreibt, ob in den Nervenscheiden Krebszellen nachweisbar
					sind.
				</div>
			{/if}
			{#if staging.s}
				<div
					class={[
						"px-1",
						showColorForClassifications ? "text-[#A3B8AA]" : undefined,
						hovered === "s" ? "rounded-sm bg-[#A3B8AA33]" : undefined,
					]}
				>
					<b>S</b> steht für Serumtumormarker.
				</div>
			{/if}
		</Drawer.Description>
	</Drawer.Header>

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div class="flex flex-col">
		<div
			role="heading"
			aria-level="3"
			class="text-md p-4 leading-none font-semibold tracking-tight"
		>
			Ihre TNM-Klassifikation zu dieser Diagnose:
		</div>
		<div
			class={[
				"flex w-full flex-row justify-center space-x-8 p-4 font-mono text-3xl font-bold whitespace-nowrap md:text-5xl",
				classes,
			]}
		>
			<!-- T -->
			{#if staging.t}
				<div class="inline-flex text-[#4A8D8D]">
					{#if staging.prefix?.t}
						<span
							onmouseenter={() => (hovered = "tPrefix")}
							onmouseleave={() => (hovered = undefined)}
							onfocus={() => (hovered = "tPrefix")}
							onblur={() => (hovered = undefined)}
							tabindex="0"
							class="cursor-pointer rounded-sm border border-[#4A8D8D33] p-1 opacity-60 hover:bg-[#4A8D8D33] focus-visible:bg-[#4A8D8D33]"
							>{staging.prefix.t}</span
						>
					{/if}
					<span
						onmouseenter={() => (hovered = "t")}
						onmouseleave={() => (hovered = undefined)}
						onfocus={() => (hovered = "t")}
						onblur={() => (hovered = undefined)}
						tabindex="0"
						class="cursor-pointer rounded-sm border border-[#4A8D8D33] p-1 hover:bg-[#4A8D8D33] focus-visible:bg-[#4A8D8D33]"
						>T{staging.t}</span
					>
				</div>
			{/if}
			<!-- N -->
			{#if staging.n}
				<div class="inline-flex text-[#5B6C9D]">
					{#if staging.prefix?.n}
						<span
							onmouseenter={() => (hovered = "nPrefix")}
							onmouseleave={() => (hovered = undefined)}
							onfocus={() => (hovered = "nPrefix")}
							onblur={() => (hovered = undefined)}
							tabindex="0"
							class="cursor-pointer rounded-sm border border-[#5B6C9D33] p-1 opacity-60 hover:bg-[#5B6C9D33] focus-visible:bg-[#5B6C9D33]"
							>{staging.prefix.n}</span
						>
					{/if}
					<span
						onmouseenter={() => (hovered = "n")}
						onmouseleave={() => (hovered = undefined)}
						onfocus={() => (hovered = "n")}
						onblur={() => (hovered = undefined)}
						tabindex="0"
						class="cursor-pointer rounded-sm border border-[#5B6C9D33] p-1 hover:bg-[#5B6C9D33] focus-visible:bg-[#5B6C9D33]"
						>N{staging.n}</span
					>
				</div>
			{/if}
			<!-- M -->
			{#if staging.m}
				<div class="inline-flex text-[#6D8057]">
					{#if staging.prefix?.m}
						<span
							onmouseenter={() => (hovered = "mPrefix")}
							onmouseleave={() => (hovered = undefined)}
							onfocus={() => (hovered = "mPrefix")}
							onblur={() => (hovered = undefined)}
							tabindex="0"
							class="cursor-pointer rounded-sm border border-[#6D805733] p-1 opacity-60 hover:bg-[#6D805733] focus-visible:bg-[#6D805733]"
							>{staging.prefix.m}</span
						>
					{/if}
					<span
						onmouseenter={() => (hovered = "m")}
						onmouseleave={() => (hovered = undefined)}
						onfocus={() => (hovered = "m")}
						onblur={() => (hovered = undefined)}
						tabindex="0"
						class="cursor-pointer rounded-sm border border-[#6D805733] p-1 hover:bg-[#6D805733] focus-visible:bg-[#6D805733]"
						>M{staging.m}</span
					>
				</div>
			{/if}
			<!-- L -->
			{#if staging.l}
				<div class="inline-flex text-[#B0A8B9]">
					<span
						onmouseenter={() => (hovered = "l")}
						onmouseleave={() => (hovered = undefined)}
						onfocus={() => (hovered = "l")}
						onblur={() => (hovered = undefined)}
						tabindex="0"
						class="cursor-pointer rounded-sm border border-[#B0A8B933] p-1 hover:bg-[#B0A8B933] focus-visible:bg-[#B0A8B933]"
						>{staging.l}</span
					>
				</div>
			{/if}
			<!-- V -->
			{#if staging.v}
				<div class="inline-flex text-[#9D7D6B]">
					<span
						onmouseenter={() => (hovered = "v")}
						onmouseleave={() => (hovered = undefined)}
						onfocus={() => (hovered = "v")}
						onblur={() => (hovered = undefined)}
						tabindex="0"
						class="cursor-pointer rounded-sm border border-[#9D7D6B33] p-1 hover:bg-[#9D7D6B33] focus-visible:bg-[#9D7D6B33]"
						>{staging.v}</span
					>
				</div>
			{/if}
			<!-- Pn -->
			{#if staging.pn}
				<div class="inline-flex text-[#7F8FA6]">
					<span
						onmouseenter={() => (hovered = "pn")}
						onmouseleave={() => (hovered = undefined)}
						onfocus={() => (hovered = "pn")}
						onblur={() => (hovered = undefined)}
						tabindex="0"
						class="cursor-pointer rounded-sm border border-[#7F8FA633] p-1 hover:bg-[#7F8FA633] focus-visible:bg-[#7F8FA633]"
						>{staging.pn}</span
					>
				</div>
			{/if}
			<!-- S -->
			{#if staging.s}
				<div class="inline-flex text-[#A3B8AA]">
					<span
						onmouseenter={() => (hovered = "s")}
						onmouseleave={() => (hovered = undefined)}
						onfocus={() => (hovered = "s")}
						onblur={() => (hovered = undefined)}
						tabindex="0"
						class="cursor-pointer rounded-sm border border-[#A3B8AA33] p-1 hover:bg-[#A3B8AA33] focus-visible:bg-[#A3B8AA33]"
						>{staging.s}</span
					>
				</div>
			{/if}
		</div>
		<!-- Descriptions -->
		<div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
			<!-- T Description -->
			{#if staging.t}
				<div class="flex flex-col justify-end gap-4 p-4 text-[#4A8D8D]">
					{#if staging.prefix?.t}
						<div
							class={[
								"grid grid-cols-3",
								hovered === "tPrefix" ? "rounded-sm bg-[#4A8D8D33] shadow-xs" : undefined,
							]}
						>
							<div
								class="flex flex-row items-center justify-center font-mono text-3xl font-bold md:text-5xl"
							>
								<span class="opacity-60">{staging.prefix?.t}</span>
							</div>
							<div class=" col-span-2 flex flex-row items-center">
								<span>{explainPrefix(staging.prefix?.t)}</span>
							</div>
						</div>
					{/if}
					<div
						class={[
							"grid grid-cols-3",
							hovered === "t" ? "rounded-sm bg-[#4A8D8D33] shadow-xs" : undefined,
						]}
					>
						<div
							class="flex flex-row items-center justify-center font-mono text-3xl font-bold md:text-5xl"
						>
							<span>T{staging.t}</span>
						</div>
						<div class=" col-span-2 flex flex-row items-center">
							<span>{explainT(staging.t)}</span>
						</div>
					</div>
				</div>
			{/if}
			<!-- N Description -->
			{#if staging.n}
				<div class="flex flex-col justify-end gap-4 p-4 text-[#5B6C9D]">
					{#if staging.prefix?.n}
						<div
							class={[
								"grid grid-cols-3",
								hovered === "nPrefix" ? "rounded-sm bg-[#5B6C9D33] shadow-xs" : undefined,
							]}
						>
							<div
								class="flex flex-row items-center justify-center font-mono text-3xl font-bold md:text-5xl"
							>
								<span class="opacity-60">{staging.prefix?.n}</span>
							</div>
							<div class=" col-span-2 flex flex-row items-center">
								<span>{explainPrefix(staging.prefix?.n)}</span>
							</div>
						</div>
					{/if}
					<div
						class={[
							"grid grid-cols-3",
							hovered === "n" ? "rounded-sm bg-[#5B6C9D33] shadow-xs" : undefined,
						]}
					>
						<div
							class="flex flex-row items-center justify-center font-mono text-3xl font-bold md:text-5xl"
						>
							<span>N{staging.n}</span>
						</div>
						<div class=" col-span-2 flex flex-row items-center">
							<span>{explainN(staging.n)}</span>
						</div>
					</div>
				</div>
			{/if}
			<!-- M Description -->
			{#if staging.m}
				<div class="flex flex-col justify-end gap-4 p-4 text-[#6D8057]">
					{#if staging.prefix?.m}
						<div
							class={[
								"grid grid-cols-3",
								hovered === "mPrefix" ? "rounded-sm bg-[#6D805733] shadow-xs" : undefined,
							]}
						>
							<div
								class="flex flex-row items-center justify-center font-mono text-3xl font-bold md:text-5xl"
							>
								<span class="opacity-60">{staging.prefix?.m}</span>
							</div>
							<div class=" col-span-2 flex flex-row items-center">
								<span>{explainPrefix(staging.prefix?.m)}</span>
							</div>
						</div>
					{/if}
					<div
						class={[
							"grid grid-cols-3",
							hovered === "m" ? "rounded-sm bg-[#6D805733] shadow-xs" : undefined,
						]}
					>
						<div
							class="flex flex-row items-center justify-center font-mono text-3xl font-bold md:text-5xl"
						>
							<span>M{staging.m}</span>
						</div>
						<div class=" col-span-2 flex flex-row items-center">
							<span>{explainM(staging.m)}</span>
						</div>
					</div>
				</div>
			{/if}
			<!-- L Description -->
			{#if staging.l}
				<div class="flex flex-col justify-end gap-4 p-4 text-[#B0A8B9]">
					<div
						class={[
							"grid grid-cols-3",
							hovered === "l" ? "rounded-sm bg-[#B0A8B933] shadow-xs" : undefined,
						]}
					>
						<div
							class="flex flex-row items-center justify-center font-mono text-3xl font-bold md:text-5xl"
						>
							<span>{staging.l}</span>
						</div>
						<div class=" col-span-2 flex flex-row items-center">
							<span>{explainL(staging.l)}</span>
						</div>
					</div>
				</div>
			{/if}
			<!-- V Description -->
			{#if staging.v}
				<div class="flex flex-col justify-end gap-4 p-4 text-[#9D7D6B]">
					<div
						class={[
							"grid grid-cols-3",
							hovered === "v" ? "rounded-sm bg-[#9D7D6B33] shadow-xs" : undefined,
						]}
					>
						<div
							class="flex flex-row items-center justify-center font-mono text-3xl font-bold md:text-5xl"
						>
							<span>{staging.v}</span>
						</div>
						<div class=" col-span-2 flex flex-row items-center">
							<span>{explainV(staging.v)}</span>
						</div>
					</div>
				</div>
			{/if}
			<!-- Pn Description -->
			{#if staging.pn}
				<div class="flex flex-col justify-end gap-4 p-4 text-[#7F8FA6]">
					<div
						class={[
							"grid grid-cols-3",
							hovered === "pn" ? "rounded-sm bg-[#7F8FA633] shadow-xs" : undefined,
						]}
					>
						<div
							class="flex flex-row items-center justify-center font-mono text-3xl font-bold md:text-5xl"
						>
							<span>{staging.pn}</span>
						</div>
						<div class=" col-span-2 flex flex-row items-center">
							<span>{explainPn(staging.pn)}</span>
						</div>
					</div>
				</div>
			{/if}
			<!-- S Description -->
			{#if staging.s}
				<div class="flex flex-col justify-end gap-4 p-4 text-[#A3B8AA]">
					<div
						class={[
							"grid grid-cols-3",
							hovered === "s" ? "rounded-sm bg-[#A3B8AA33] shadow-xs" : undefined,
						]}
					>
						<div
							class="flex flex-row items-center justify-center font-mono text-3xl font-bold md:text-5xl"
						>
							<span>{staging.s}</span>
						</div>
						<div class=" col-span-2 flex flex-row items-center">
							<span>{explainS(staging.s)}</span>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
