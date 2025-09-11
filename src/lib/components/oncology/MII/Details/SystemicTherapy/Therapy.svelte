<script lang="ts">
	import Calendar from "@lucide/svelte/icons/calendar";
	import Activity from "@lucide/svelte/icons/activity";
	import Layers from "@lucide/svelte/icons/layers";
	import FlaskConical from "@lucide/svelte/icons/flask-conical";

	interface Props {
		therapyType: string;
		treatmentPeriod: {
			startDate: string;
			endDate: string;
		};
		therapyIntention: string;
		surgicalPosition: string;
	}

	let { therapyType, treatmentPeriod, therapyIntention, surgicalPosition }: Props = $props();
</script>

<div class="border-border bg-card flex flex-col gap-6 rounded-lg border p-4 shadow-xs">
	<h3 class="mt-0 font-medium">Systemische Therapie</h3>

	<div class="flex items-start gap-2">
		<FlaskConical class="mt-0.5 shrink-0" size={16} />
		<div>
			<div class="font-medium">Therapieart</div>
			<div class="text-muted-foreground">{therapyType}</div>
		</div>
	</div>

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
			<div class="text-muted-foreground">{therapyIntention}</div>
		</div>
	</div>

	<div class="flex items-start gap-2">
		<Layers class="mt-0.5 shrink-0" size={16} />
		<div>
			<div class="font-medium">Stellung zur Operation</div>
			<div class="text-muted-foreground">{surgicalPosition}</div>
		</div>
	</div>
</div>
