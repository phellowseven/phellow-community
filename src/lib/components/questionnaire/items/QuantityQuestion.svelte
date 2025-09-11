<!-- src/lib/components/questionnaire/items/QuantityQuestion.svelte -->
<script lang="ts">
	import type { ItemComponentInterface } from "./itemComponentInterface";
	import type { Quantity } from "fhir/r4";

	import Input from "$ui/input/input.svelte";
	import * as Select from "$ui/select";

	let {
		item,
		value = undefined,
		onAnswer,
		disabled = false,
	}: ItemComponentInterface<Quantity> = $props();

	let numericValue = $state(value?.value?.toString() ?? "");
	let selectedUnit = $state(value?.unit ?? "");
	let error = $state("");

	// Get available units from item extensions or provide common defaults
	let availableUnits = $derived(() => {
		// Check for FHIR questionnaire unit extension
		const unitExtension = item.extension?.find(
			(ext) => ext.url === "http://hl7.org/fhir/StructureDefinition/questionnaire-unit"
		);

		if (unitExtension?.valueCoding) {
			return [
				{
					code: unitExtension.valueCoding.code || "",
					display: unitExtension.valueCoding.display || unitExtension.valueCoding.code || "",
					system: unitExtension.valueCoding.system,
				},
			];
		}

		// Check for multiple units in choice extension
		const choiceExtension = item.extension?.find(
			(ext) => ext.url === "http://hl7.org/fhir/StructureDefinition/questionnaire-unitOption"
		);

		if (choiceExtension?.extension) {
			return choiceExtension.extension
				.filter((ext) => ext.url === "option" && ext.valueCoding)
				.map((ext) => ({
					code: ext.valueCoding!.code || "",
					display: ext.valueCoding!.display || ext.valueCoding!.code || "",
					system: ext.valueCoding!.system,
				}));
		}

		// Fallback to common units if no extension is found
		return [
			{ code: "kg", display: "kg", system: "http://unitsofmeasure.org" },
			{ code: "g", display: "g", system: "http://unitsofmeasure.org" },
			{ code: "mg", display: "mg", system: "http://unitsofmeasure.org" },
			{ code: "cm", display: "cm", system: "http://unitsofmeasure.org" },
			{ code: "m", display: "m", system: "http://unitsofmeasure.org" },
			{ code: "mm", display: "mm", system: "http://unitsofmeasure.org" },
			{ code: "L", display: "L", system: "http://unitsofmeasure.org" },
			{ code: "mL", display: "mL", system: "http://unitsofmeasure.org" },
		];
	});

	function handleValueChange(e: Event) {
		const input = e.target as HTMLInputElement;
		numericValue = input.value;
		error = "";

		if (input.value === "") {
			onAnswer(undefined);
			return;
		}

		const num = parseFloat(input.value);
		if (isNaN(num)) {
			error = "Please enter a valid number";
			return;
		}

		updateQuantity(num, selectedUnit);
	}

	$effect(() => {
		if (numericValue && numericValue !== "") {
			const num = parseFloat(numericValue);
			if (!isNaN(num)) {
				updateQuantity(num, selectedUnit);
			}
		}
	});

	function updateQuantity(value: number, unit: string) {
		const units = availableUnits();
		const selectedUnitInfo = units.find(
			(
				u:
					| {
							code: string;
							display: string;
							system: string | undefined;
					  }
					| {
							code: string;
							display: string;
					  }
			) => u.code === unit
		);

		const quantity: Quantity = {
			value: value,
			unit: unit,
			code: selectedUnitInfo?.code,
			system: selectedUnitInfo?.system,
		};

		onAnswer(quantity);
	}

	// Initialize selected unit if not set but value exists
	$effect(() => {
		const units = availableUnits();
		if (!selectedUnit && units.length > 0) {
			selectedUnit = units[0].code;
		}
	});
</script>

<div class="flex flex-col gap-2">
	<div class="flex gap-2">
		<div class="flex-1">
			<Input
				type="number"
				value={numericValue}
				oninput={handleValueChange}
				placeholder="Enter value"
				{disabled}
				step="any"
			/>
		</div>

		{#if availableUnits().length > 1}
			<div class="w-24">
				<Select.Root type="single" bind:value={selectedUnit} {disabled}>
					<Select.Trigger>
						<Select.Item value={selectedUnit} label={selectedUnit || "Unit"} placeholder="Unit" />
					</Select.Trigger>
					<Select.Content>
						{#each availableUnits() as unit}
							<Select.Item value={unit.code} label={unit.display} />
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
		{:else if availableUnits().length === 1}
			<div
				class="text-muted-foreground bg-muted flex min-w-16 items-center justify-center rounded-md border px-3 text-sm"
			>
				{availableUnits()[0].display}
			</div>
		{/if}
	</div>

	{#if error}
		<span class="text-destructive-foreground text-sm">{error}</span>
	{/if}
</div>
