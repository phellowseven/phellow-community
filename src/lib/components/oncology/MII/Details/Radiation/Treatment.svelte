<script lang="ts">
	import Calendar from "@lucide/svelte/icons/calendar";
	import Activity from "@lucide/svelte/icons/activity";
	import Layers from "@lucide/svelte/icons/layers";

	interface Props {
		treatmentPeriod: {
			startDate: string;
			endDate: string;
		};
		radiationIntention: string;
		radiationPosition: string;
	}

	let { treatmentPeriod, radiationIntention, radiationPosition }: Props = $props();
</script>

<div class="border-border bg-card flex flex-col gap-4 rounded-lg border p-4 shadow-xs">
	<h3 class="mt-0 font-medium">Strahlentherapie</h3>

	<div class="flex items-start gap-2">
		<Calendar class="mt-0.5 shrink-0" size={16} />
		<div>
			<div class="font-medium">Behandlungszeitraum</div>
			<div class="text-muted-foreground">
				{treatmentPeriod.startDate} bis {treatmentPeriod.endDate}
			</div>
		</div>
	</div>

	<div class="flex items-start gap-2">
		<Activity class="mt-0.5 shrink-0" size={16} />
		<div>
			<div class="font-medium">Therapieintention</div>
			<div class="text-muted-foreground">{radiationIntention}</div>
		</div>
	</div>

	<div class="flex items-start gap-2">
		<Layers class="mt-0.5 shrink-0" size={16} />
		<div>
			<div class="font-medium">Therapie-Stellung</div>
			<div class="text-muted-foreground">{radiationPosition}</div>
		</div>
	</div>
</div>
