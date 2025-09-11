<script lang="ts">
	import Calendar from "@lucide/svelte/icons/calendar";
	import BarChart from "@lucide/svelte/icons/bar-chart";

	interface Props {
		grade: string;
		date: string;
	}

	let { grade, date }: Props = $props();
</script>

<div class="border-border bg-card rounded-lg border p-4 shadow-xs">
	<h3 class="mt-0 mb-2 font-medium md:mb-8">Grading</h3>
	<div class="flex flex-col gap-2 md:gap-4">
		<div class="flex items-start gap-2">
			<BarChart class="mt-0.5 shrink-0" size={16} />
			<div>
				<div class="font-medium">Differenzierungsgrad</div>
				<div class="text-muted-foreground">{grade}</div>
			</div>
		</div>
		<div class="flex items-start gap-2">
			<Calendar class="mt-0.5 shrink-0" size={16} />
			<div>
				<div class="font-medium">Befunddatum</div>
				<div class="text-muted-foreground">{date}</div>
			</div>
		</div>
	</div>
</div>
