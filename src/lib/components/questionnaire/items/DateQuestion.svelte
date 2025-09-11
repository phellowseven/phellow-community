<!-- 
DateQuestion Component

A FHIR-compliant date input component that supports both full date picker and partial date inputs.
The component's behavior is controlled by FHIR extensions for maximum flexibility.

FHIR Extension Support:
The component reads the 'date-precision-mode' extension to determine its behavior:

Extension URL: http://[your-domain]/fhir/StructureDefinition/date-precision-mode

Supported valueCode values:

1. "full" (default)
   - Shows a full calendar date picker
   - Returns CalendarDate object
   - Used when no extension is present

2. "partial" 
   - Shows individual year/month/day input fields
   - All fields are optional (user can enter year only, year-month, or full date)
   - Returns string in format: "YYYY", "YYYY-MM", or "YYYY-MM-DD"

3. "year-only"
   - Shows only year input field
   - Month and day fields are hidden
   - Returns string in format: "YYYY"

4. "year-month"
   - Shows year and month input fields
   - Day field is hidden
   - Returns string in format: "YYYY-MM"

5. "auto"
   - Shows toggle button to switch between full and partial modes
   - User can dynamically choose input method
   - Returns either CalendarDate object or partial date string

Example FHIR Questionnaire Item:
{
  "linkId": "diagnosis_date",
  "type": "date",
  "text": "Date of diagnosis",
  "extension": [
    {
      "url": "http://phellowseven.com/fhir/StructureDefinition/date-precision-mode",
      "valueCode": "partial"
    }
  ]
}
-->
<script lang="ts">
	import type { ItemComponentInterface } from "./itemComponentInterface";

	import { CalendarDate, DateFormatter, getLocalTimeZone } from "@internationalized/date";

	import { cn } from "$lib/utils";
	import Input from "$ui/input/input.svelte";
	import { Button, buttonVariants } from "$ui/button";
	import { Calendar } from "$ui/calendar";
	import * as Popover from "$ui/popover";

	import CalendarIcon from "@lucide/svelte/icons/calendar";
	import { getLocale } from "$lib/paraglide/runtime";

	let {
		item,
		value = undefined,
		onAnswer,
		disabled = false,
	}: ItemComponentInterface<CalendarDate | string | undefined> = $props();

	const df = new DateFormatter(getLocale(), {
		dateStyle: "long",
	});

	// FHIR Extension Processing
	// Look for date-precision-mode extension to determine component behavior
	const datePrecisionExt = item.extension?.find((ext) => ext.url?.includes("date-precision-mode"));

	const precisionMode = datePrecisionExt?.valueCode || "full";

	// Configure component behavior based on extension value
	const allowToggle = precisionMode === "auto"; // Show mode toggle button
	const defaultToFull = precisionMode === "full" || (!precisionMode && !datePrecisionExt); // Use calendar picker by default
	const forcePartial = precisionMode === "partial"; // Force partial date inputs
	const yearOnly = precisionMode === "year-only"; // Show only year field
	const yearMonth = precisionMode === "year-month"; // Show year and month fields only

	// State for individual date components
	let year = $state<number | undefined>();
	let month = $state<number | undefined>();
	let day = $state<number | undefined>();

	// State for full date picker
	let dateValue = $state<CalendarDate | undefined>();
	let useFullPicker = $state(forcePartial ? false : defaultToFull);
	let contentRef = $state<HTMLElement | null>(null);

	// Initialize from value once on mount
	if (value) {
		if (typeof value === "string") {
			// Parse partial date string like "2023", "2023-03", or "2023-03-15"
			const parts = value.split("-");
			year = parts[0] ? parseInt(parts[0]) : undefined;
			month = parts[1] ? parseInt(parts[1]) : undefined;
			day = parts[2] ? parseInt(parts[2]) : undefined;
			// Only override useFullPicker if we allow toggling, otherwise respect extension
			if (allowToggle) {
				useFullPicker = false;
			}
		} else if (value instanceof CalendarDate) {
			dateValue = value;
			// Only override useFullPicker if we allow toggling, otherwise respect extension
			if (allowToggle) {
				useFullPicker = true;
			}
		}
	}

	function updatePartialDate() {
		let dateStr = "";
		if (year) {
			dateStr = year.toString();
			if (month) {
				dateStr += `-${month.toString().padStart(2, "0")}`;
				if (day) {
					dateStr += `-${day.toString().padStart(2, "0")}`;
				}
			}
		}

		const newValue = dateStr && dateStr !== "" ? dateStr : undefined;
		onAnswer(newValue);
	}

	function updateFullDate(newDateValue: CalendarDate | undefined) {
		dateValue = newDateValue;
		onAnswer(newDateValue);
	}

	function handleCalendarChange(value: any) {
		updateFullDate(value as CalendarDate | undefined);
	}

	function toggleInputMode() {
		if (useFullPicker) {
			// Convert full date to partial if possible
			if (dateValue) {
				year = dateValue.year;
				month = dateValue.month;
				day = dateValue.day;
				updatePartialDate();
			}
			dateValue = undefined;
		} else {
			// Convert partial date to full if we have complete date
			if (year && month && day) {
				try {
					const newDate = new CalendarDate(year, month, day);
					updateFullDate(newDate);
				} catch {
					// Invalid date, keep partial mode
					return;
				}
			}
			year = undefined;
			month = undefined;
			day = undefined;
		}
		useFullPicker = !useFullPicker;
	}

	function formatPartialDate(): string {
		if (!year) return "Kein Datum ausgewählt";

		let formatted = year.toString();
		if (month) {
			const monthNames = [
				"",
				"Januar",
				"Februar",
				"März",
				"April",
				"Mai",
				"Juni",
				"Juli",
				"August",
				"September",
				"Oktober",
				"November",
				"Dezember",
			];
			formatted = `${monthNames[month]} ${year}`;
			if (day) {
				formatted = `${monthNames[month]} ${day}, ${year}`;
			}
		}
		return formatted;
	}

	// Validation for inputs
	function validateYear(value: string): number | undefined {
		const num = parseInt(value);
		if (isNaN(num) || num < 1900 || num > 2100) return undefined;
		return num;
	}

	function validateMonth(value: string): number | undefined {
		const num = parseInt(value);
		if (isNaN(num) || num < 1 || num > 12) return undefined;
		return num;
	}

	function validateDay(value: string): number | undefined {
		const num = parseInt(value);
		if (isNaN(num) || num < 1 || num > 31) return undefined;
		return num;
	}
</script>

<div class="flex flex-col gap-2">
	{#if allowToggle}
		<div class="mb-2 flex items-center gap-2">
			<Button variant="outline" size="sm" onclick={toggleInputMode} {disabled}>
				{useFullPicker ? "Teildatum verwenden" : "Vollständige Datumsauswahl verwenden"}
			</Button>
		</div>
	{/if}

	{#if useFullPicker}
		<!-- Full date picker mode -->
		<Popover.Root>
			<Popover.Trigger
				class={cn(
					buttonVariants({
						variant: "outline",
						class: "w-[280px] justify-start text-left font-normal",
					}),
					!dateValue && "text-muted-foreground"
				)}
				{disabled}
			>
				<CalendarIcon />
				{dateValue ? df.format(dateValue.toDate(getLocalTimeZone())) : "Datum auswählen"}
			</Popover.Trigger>
			<Popover.Content bind:ref={contentRef} class="w-auto p-0">
				<Calendar type="single" value={dateValue} onValueChange={handleCalendarChange} />
			</Popover.Content>
		</Popover.Root>
	{:else}
		<!-- Partial date input mode -->
		<div class="flex flex-col gap-3">
			<div class="flex items-center gap-2">
				<div class="flex flex-col gap-1">
					<label for="year" class="text-sm font-medium">Jahr</label>
					<Input
						id="year"
						type="number"
						placeholder="YYYY"
						value={year?.toString() || ""}
						oninput={(e) => {
							const target = e.target as HTMLInputElement;
							year = validateYear(target.value);
							updatePartialDate();
						}}
						{disabled}
						min="1900"
						max="2100"
					/>
				</div>

				{#if !yearOnly}
					<div class="flex flex-col gap-1">
						<label for="month" class="text-sm font-medium"
							>Monat {yearMonth ? "" : "(optional)"}</label
						>
						<Input
							id="month"
							type="number"
							placeholder="MM"
							value={month?.toString() || ""}
							oninput={(e) => {
								const target = e.target as HTMLInputElement;
								month = validateMonth(target.value);
								updatePartialDate();
							}}
							{disabled}
							min="1"
							max="12"
						/>
					</div>
				{/if}

				{#if !yearOnly && !yearMonth}
					<div class="inline-flex flex-col gap-1">
						<label for="day" class="text-sm font-medium">Tag (optional)</label>
						<Input
							id="day"
							type="number"
							placeholder="DD"
							value={day?.toString() || ""}
							class="justify-end"
							oninput={(e) => {
								const target = e.target as HTMLInputElement;
								day = validateDay(target.value);
								updatePartialDate();
							}}
							{disabled}
							min="1"
							max="31"
						/>
					</div>
				{/if}
			</div>

			<div class="text-muted-foreground text-sm">
				{formatPartialDate()}
			</div>
		</div>
	{/if}
</div>
