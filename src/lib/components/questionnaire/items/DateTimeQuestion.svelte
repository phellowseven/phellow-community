<!-- src/lib/components/questionnaire/items/DateQuestion.svelte -->
<script lang="ts">
	import type { ItemComponentInterface } from "./itemComponentInterface";

	import {
		DateFormatter,
		getLocalTimeZone,
		now,
		Time,
		type DateValue,
	} from "@internationalized/date";

	import { cn } from "$lib/utils";
	import { languageTag } from "$lib/paraglide/runtime";

	import { buttonVariants } from "$ui/button";
	import { Calendar } from "$ui/calendar";
	import * as Popover from "$ui/popover";

	import CalendarIcon from "lucide-svelte/icons/calendar";
	import TimePicker from "$components/ui/time-picker/time-picker.svelte";

	let {
		item,
		value = undefined,
		onAnswer,
	}: ItemComponentInterface<DateValue | undefined> = $props();

	const df = new DateFormatter(languageTag(), {
		dateStyle: "long",
		timeStyle: "medium",
	});

	let contentRef = $state<HTMLElement | null>(null);
	let date = $state<DateValue | undefined>(value ?? undefined);
	// svelte-ignore state_referenced_locally
	let dateValue = $state<DateValue | undefined>(date);
	let time = $state(
		// svelte-ignore state_referenced_locally
		new Time(
			date && "hour" in date ? (date?.hour ?? 0) : 0,
			date && "minute" in date ? (date?.minute ?? 0) : 0
		)
	);

	function onValueChange(_date: DateValue | undefined) {
		date = date?.set({
			year: _date?.year,
			month: _date?.month,
			day: _date?.day,
			minute: time.minute,
			hour: time.hour,
			second: time.second,
		});

		onAnswer(date);
	}

	function setTime(time: Time) {
		if (!date) {
			date = now(getLocalTimeZone()).set({
				minute: time.minute,
				hour: time.hour,
				second: time.second,
			});
			dateValue = date;
		}
		date = date?.set({
			minute: time.minute,
			hour: time.hour,
			second: time.second,
		});

		onAnswer(date);
	}
</script>

<div class="flex flex-col gap-2">
	<Popover.Root>
		<Popover.Trigger
			class={cn(
				buttonVariants({
					variant: "outline",
					class: "w-[280px] justify-start text-left font-normal",
				}),
				!date && "text-muted-foreground"
			)}
		>
			<CalendarIcon />
			{date ? df.format(date.toDate(getLocalTimeZone())) : "Pick a date"}
		</Popover.Trigger>
		<Popover.Content bind:ref={contentRef} class="w-auto p-0">
			<div class="flex border-b p-2">
				<TimePicker
					view="dotted"
					bind:time
					setTime={(time) => {
						time && setTime(time);
					}}
				/>
			</div>

			<Calendar {onValueChange} type="single" bind:value={dateValue} />
		</Popover.Content>
	</Popover.Root>
</div>
