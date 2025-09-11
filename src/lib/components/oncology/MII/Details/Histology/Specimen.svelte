<script lang="ts">
	import Calendar from "@lucide/svelte/icons/calendar";
	import FileText from "@lucide/svelte/icons/file-text";
	import type { DiagnosticReport } from "fhir/r4";

	interface Props {
		id: string;
		collectionDate: string;
		status: string;
		befund: DiagnosticReport;
	}

	let { id, collectionDate, status, befund }: Props = $props();
</script>

<div class="border-border bg-card flex flex-col rounded-lg border p-4 shadow-xs">
	<h3 class="mt-0 mb-2 font-medium md:mb-8">Gewebe-Probe</h3>
	<div class="flex flex-col gap-2 md:gap-4">
		<div class="flex items-start gap-2">
			<Calendar class="mt-0.5 shrink-0" size={16} />
			<div>
				<div class="font-medium">Entnahmedatum</div>
				<div class="text-muted-foreground">{collectionDate}</div>
			</div>
		</div>
		<div class="flex items-start gap-2">
			<FileText class="mt-0.5 shrink-0" size={16} />
			<div>
				<div class="font-medium">Proben-ID</div>
				<div class="text-muted-foreground">{id}</div>
			</div>
		</div>
	</div>

	<div>
		<h3 class="my-2 font-medium md:my-4">Histologischer Befund</h3>
		<div class="">{befund.conclusion}</div>
	</div>
</div>
