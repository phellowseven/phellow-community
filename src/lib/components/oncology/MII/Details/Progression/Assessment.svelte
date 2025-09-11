<script lang="ts">
	import Calendar from "@lucide/svelte/icons/calendar";
	import TrendingDown from "@lucide/svelte/icons/trending-down";
	import Activity from "@lucide/svelte/icons/activity";

	import { getStatusColor } from "./helper";

	interface Props {
		status: string;
		date?: string;
		code?: string;
		display?: string;
	}

	let { status, date, code, display }: Props = $props();
</script>

<div class="border-border bg-card flex flex-col gap-6 rounded-lg border p-4 shadow-xs">
	<h3 class="mt-0 font-medium">Verlaufsbeurteilung</h3>

	<div class="flex items-start gap-2">
		<Calendar class="mt-0.5 shrink-0" size={16} />
		<div>
			<div class="font-medium">Beurteilungsdatum</div>
			<div class="text-muted-foreground">{date ?? "Nicht dokumentiert"}</div>
		</div>
	</div>

	<div class="flex items-start gap-2">
		<TrendingDown class="mt-0.5 shrink-0" size={16} />
		<div>
			<div class="font-medium">Gesamtbeurteilung</div>
			<div class="mt-1 flex items-center gap-2">
				<span
					class={[
						"inline-block size-3 shrink-0 rounded-full",
						code ? getStatusColor(code) : undefined,
					]}
				></span>
				<div class="text-muted-foreground">{display ?? "Nicht dokumentiert"}</div>
			</div>
		</div>
	</div>

	<div class="flex items-start gap-2">
		<Activity class="mt-0.5 shrink-0" size={16} />
		<div>
			<div class="font-medium">Status</div>
			<div class="text-muted-foreground">
				{status === "final"
					? "Final (abgeschlossen)"
					: status === "preliminary"
						? "Vorläufig"
						: status || "Unbekannt"}
			</div>
		</div>
	</div>
</div>
