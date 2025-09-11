<script lang="ts">
	import Calendar from "@lucide/svelte/icons/calendar";
	import MapPin from "@lucide/svelte/icons/map-pin";
	import Activity from "@lucide/svelte/icons/activity";
	import CircleDashed from "@lucide/svelte/icons/circle-dashed";

	interface Props {
		metastasisLocation: string;
		detectionDate: string;
		detectionMethod: string;
		status: string;
	}

	let { metastasisLocation, detectionDate, detectionMethod, status }: Props = $props();
</script>

<div class="border-border bg-card rounded-lg border p-4 shadow-xs">
	<h3 class="mt-0 mb-4 font-medium md:mb-8">Fernmetastase</h3>

	<div class="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-4">
		<div class="flex items-start gap-2">
			<MapPin class="mt-0.5 shrink-0" size={16} />
			<div>
				<div class="font-medium">Lokalisation</div>
				<div class="text-gray-700">{metastasisLocation}</div>
			</div>
		</div>

		<div class="flex items-start gap-2">
			<Calendar class="mt-0.5 shrink-0" size={16} />
			<div>
				<div class="font-medium">Feststellungsdatum</div>
				<div class="text-gray-700">{detectionDate}</div>
			</div>
		</div>

		<div class="flex items-start gap-2">
			<CircleDashed class="mt-0.5 shrink-0" size={16} />
			<div>
				<div class="font-medium">Nachweismethode</div>
				<div class="text-gray-700">{detectionMethod}</div>
			</div>
		</div>

		<div class="flex items-start gap-2">
			<Activity class="mt-0.5 shrink-0" size={16} />
			<div>
				<div class="font-medium">Status</div>
				<div class="text-gray-700">{status}</div>
			</div>
		</div>
	</div>
</div>
