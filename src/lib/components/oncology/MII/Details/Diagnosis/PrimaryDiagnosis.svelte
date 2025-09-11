<script lang="ts">
	import type { Coding } from "fhir/r4";
	import { twMerge } from "tailwind-merge";

	interface Props {
		icd: {
			code: string | undefined;
			display: string | undefined;
			side: string | undefined;
		} | null;
		morphology: {
			code: string | undefined;
			display: string | undefined;
		} | null;
		bodySite: Coding | undefined;
		class?: string;
	}

	let { icd, morphology, bodySite, class: classes }: Props = $props();
</script>

<div
	class={twMerge(
		"border-border bg-card flex flex-col gap-8 rounded-lg border p-4 shadow-xs",
		classes
	)}
>
	{#if icd}
		<div>
			<div class="flex items-center justify-start gap-2">
				<h3 class="mt-0 font-medium">ICD-10</h3>
				<span
					class="bg-muted text-muted-foreground inline-block rounded px-2 py-1 text-xs font-medium"
				>
					{icd.code}
				</span>
			</div>
			<div class="text-muted-foreground mt-1">{icd.display}</div>
			{#if icd.side}
				<div class="mt-1 text-sm">
					Seite: <span class="text-muted-foreground">{icd.side}</span>
				</div>
			{/if}
		</div>
	{/if}

	{#if morphology}
		<div>
			<div class="flex items-center justify-start gap-2">
				<h3 class="mt-0 font-medium">Morphologie</h3>
				<span
					class="bg-muted text-muted-foreground inline-block rounded px-2 py-1 text-xs font-medium"
				>
					{morphology.code}
				</span>
			</div>
			<div class="text-muted-foreground mt-1">{morphology.display}</div>
		</div>
	{/if}

	{#if bodySite}
		<div>
			<div class="flex items-center justify-start gap-2">
				<h3 class="mt-0 font-medium">Topographie</h3>
				<span
					class="bg-muted text-muted-foreground inline-block rounded px-2 py-1 text-xs font-medium"
				>
					{bodySite.code}
				</span>
			</div>
			<div class="text-muted-foreground mt-1">{bodySite.display}</div>
		</div>
	{/if}
</div>
