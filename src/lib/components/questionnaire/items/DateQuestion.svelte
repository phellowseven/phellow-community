<!-- src/lib/components/questionnaire/items/DateQuestion.svelte -->
<script lang="ts">
	import type { ItemComponentInterface } from "./itemComponentInterface";

	import {
		CalendarDate,
		DateFormatter,
		getLocalTimeZone,
		toCalendarDate,
	} from "@internationalized/date";

	import { cn } from "$lib/utils";

	import { buttonVariants } from "$ui/button";
	import { Calendar } from "$ui/calendar";
	import * as Popover from "$ui/popover";

	import CalendarIcon from "lucide-svelte/icons/calendar";
	import { getLocale } from "$lib/paraglide/runtime";

	let {
		item,
		value = undefined,
		onAnswer,
	}: ItemComponentInterface<CalendarDate | undefined> = $props();

	const df = new DateFormatter(getLocale(), {
		dateStyle: "long",
	});

	let dateValue = $state<CalendarDate | undefined>(value ?? undefined);
	let contentRef = $state<HTMLElement | null>(null);
	$effect(() => {
		if (dateValue) {
			onAnswer(toCalendarDate(dateValue));
		}
	});
</script>

<div class="flex flex-col gap-2">
	<Popover.Root>
		<Popover.Trigger
			class={cn(
				buttonVariants({
					variant: "outline",
					class: "w-[280px] justify-start text-left font-normal",
				}),
				!dateValue && "text-muted-foreground"
			)}
		>
			<CalendarIcon />
			{dateValue ? df.format(dateValue.toDate(getLocalTimeZone())) : "Pick a date"}
		</Popover.Trigger>
		<Popover.Content bind:ref={contentRef} class="w-auto p-0">
			<Calendar type="single" bind:value={dateValue} />
		</Popover.Content>
	</Popover.Root>
</div>
