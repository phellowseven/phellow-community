<script lang="ts">
	import Calendar from "@lucide/svelte/icons/calendar";
	import Activity from "@lucide/svelte/icons/activity";
	import Target from "@lucide/svelte/icons/target";

	interface Props {
		examined: {
			regional: number;
			sentinel: number;
		};
		positive: {
			regional: number;
			sentinel: number;
		};
		date: string;
	}

	let { examined, positive, date }: Props = $props();
</script>

<div class="border-border bg-card rounded-lg border p-4 shadow-xs">
	<h3 class="mt-0 mb-4 font-medium md:mb-8">Lymphknoten-Status</h3>
	<div class="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-4">
		<div class="flex flex-col gap-2 md:gap-4">
			<div class="flex items-start gap-2">
				<Target class="mt-0.5 shrink-0" size={16} />
				<div>
					<div class="font-medium">Untersuchte regionale Lymphknoten</div>
					<div class="text-muted-foreground">{examined.regional}</div>
				</div>
			</div>
			<div class="flex items-start gap-2">
				<Activity class="mt-0.5 shrink-0" size={16} />
				<div>
					<div class="font-medium">Befallene regionale Lymphknoten</div>
					<div class="text-muted-foreground">{positive.regional}</div>
				</div>
			</div>
		</div>
		<div class="flex flex-col gap-2 md:gap-4">
			<div class="flex items-start gap-2">
				<Target class="mt-0.5 shrink-0" size={16} />
				<div>
					<div class="font-medium">Untersuchte Sentinel-Lymphknoten</div>
					<div class="text-muted-foreground">{examined.sentinel}</div>
				</div>
			</div>
			<div class="flex items-start gap-2">
				<Activity class="mt-0.5 shrink-0" size={16} />
				<div>
					<div class="font-medium">Befallene Sentinel-Lymphknoten</div>
					<div class="text-muted-foreground">{positive.sentinel}</div>
				</div>
			</div>
		</div>
		<div class="flex items-start gap-2">
			<Calendar class="mt-0.5 shrink-0" size={16} />
			<div>
				<div class="font-medium">Untersuchungsdatum</div>
				<div class="text-muted-foreground">{date}</div>
			</div>
		</div>
	</div>
</div>
