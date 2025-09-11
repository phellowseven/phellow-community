<script lang="ts">
	import Calendar from "@lucide/svelte/icons/calendar";
	import Pill from "@lucide/svelte/icons/pill";
	import Activity from "@lucide/svelte/icons/activity";
	import FileText from "@lucide/svelte/icons/file-text";

	interface Props {
		medicationInfo: {
			medicationName: string;
			medicationCode?: string;
			protocol: string;
			status: string;
		};
		medicationPeriod: {
			startDate: string;
			endDate: string;
		};
	}

	let { medicationInfo, medicationPeriod }: Props = $props();
</script>

<div class="border-border bg-card flex flex-col gap-6 rounded-lg border p-4 shadow-xs">
	<h3 class="mt-0 font-medium">Medikation</h3>

	<div class="flex items-start gap-2">
		<Pill class="mt-0.5 shrink-0" size={16} />
		<div>
			<div class="font-medium">Medikament</div>
			<div class="text-muted-foreground">
				{medicationInfo.medicationName}
				{#if medicationInfo.medicationCode}
					<span
						class="text-muted-foreground ml-2 inline-block rounded bg-gray-100 px-2 py-0.5 text-xs font-medium"
					>
						{medicationInfo.medicationCode}
					</span>
				{/if}
			</div>
		</div>
	</div>

	<div class="flex items-start gap-2">
		<FileText class="mt-0.5 shrink-0" size={16} />
		<div>
			<div class="font-medium">Protokoll</div>
			<div class="text-muted-foreground">{medicationInfo.protocol}</div>
		</div>
	</div>

	<div class="flex items-start gap-2">
		<Calendar class="mt-0.5 shrink-0" size={16} />
		<div>
			<div class="font-medium">Verabreichungszeitraum</div>
			<div class="text-muted-foreground">
				{medicationPeriod.startDate} bis {medicationPeriod.endDate}
			</div>
		</div>
	</div>

	<div class="flex items-start gap-2">
		<Activity class="mt-0.5 shrink-0" size={16} />
		<div>
			<div class="font-medium">Status</div>
			<div class="text-muted-foreground">{medicationInfo.status}</div>
		</div>
	</div>
</div>
