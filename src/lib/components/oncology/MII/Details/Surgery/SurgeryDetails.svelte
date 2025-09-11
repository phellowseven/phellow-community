<script lang="ts">
	import Calendar from "@lucide/svelte/icons/calendar";
	import Scissors from "@lucide/svelte/icons/scissors";
	import Activity from "@lucide/svelte/icons/activity";

	interface Props {
		name: string;
		code?: string;
		version?: string;
		date: string;
		status: string;
		surgeryIntention: string;
	}

	let { name, code, version, date, status, surgeryIntention }: Props = $props();
</script>

<div class="border-border bg-card flex flex-col gap-4 rounded-lg border p-4 shadow-xs">
	<h3 class="mt-0 font-medium">Operation</h3>

	<div class="flex items-start gap-2">
		<Scissors class="mt-0.5 shrink-0" size={16} />
		<div>
			<div class="font-medium">Eingriffsart</div>
			<div class="text-muted-foreground">{name}</div>
			{#if code}
				<div class="mt-1 text-sm">
					Code: <span class="font-medium">{code}</span>
					{#if version}
						<span class="ml-1">({version})</span>
					{/if}
				</div>
			{/if}
		</div>
	</div>

	<div class="flex items-start gap-2">
		<Calendar class="mt-0.5 shrink-0" size={16} />
		<div>
			<div class="font-medium">Operationsdatum</div>
			<div class="text-muted-foreground">{date}</div>
		</div>
	</div>

	<div class="flex items-start gap-2">
		<Activity class="mt-0.5 shrink-0" size={16} />
		<div>
			<div class="font-medium">Operationsziel</div>
			<div class="text-muted-foreground">{surgeryIntention}</div>
		</div>
	</div>
</div>
