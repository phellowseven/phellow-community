<script lang="ts">
	import { fileProxy, superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import {
		type DateValue,
		parseDate,
		DateFormatter,
		today,
		getLocalTimeZone,
		CalendarDate,
	} from "@internationalized/date";

	import { buttonVariants } from "$ui/button/index.js";
	import * as Sheet from "$ui/sheet";
	import * as Form from "$ui/form";
	import * as Select from "$ui/select";
	import * as Popover from "$ui/popover";
	import { FileInput } from "$ui/input";
	import { CalendarYearMonth } from "$ui/calendar";

	import Loader from "@lucide/svelte/icons/loader";
	import CalendarIcon from "@lucide/svelte/icons/calendar";
	import Upload from "@lucide/svelte/icons/upload";

	import { sheet } from "../../../routes/(app)/sheet.svelte";
	import { uploadDocumentSchema, type UploadDocumentSchema } from "$lib/fhir/document/form";
	import { UploadCategory } from "$lib/fhir/document/uploadMappings";
	import * as m from "$lib/paraglide/messages";
	import { cn } from "$lib/utils";
	import { route } from "$lib/ROUTES";
	import { getLocale } from "$lib/paraglide/runtime";

	interface Props {
		validatedForm: SuperValidated<Infer<UploadDocumentSchema>>;
	}

	let { validatedForm }: Props = $props();

	const form = superForm(validatedForm, {
		onResult({ result }) {
			if (result.type == "success") sheet.open = false;
		},
		resetForm: true,
		validators: zodClient(uploadDocumentSchema),
	});

	const { form: formData, enhance, delayed } = form;

	let uploadCategories = Object.values(UploadCategory)
		.map((val) => ({
			value: val,
			name: val.toUpperCase(), // TODO: Translation String here!
		}))
		.sort((a, b) => a.name.localeCompare(b.name));

	// Date
	const df = new DateFormatter(getLocale(), {
		dateStyle: "long",
	});
	let dateValue: DateValue | undefined = $state(undefined);
	$effect(() => {
		dateValue = $formData.date ? parseDate($formData.date) : undefined;
	});
	let datePlaceholder = $state(today(getLocalTimeZone()));

	// File
	let file = $state(fileProxy(formData, "file"));
</script>

<Sheet.Root
	open={sheet.open}
	onOpenChange={(open) => {
		sheet.open = open;
		if (!open) {
			form.reset();
		}
	}}
>
	<Sheet.Content side="right" class="m-4 h-auto overflow-y-auto rounded-lg">
		<Sheet.Header>
			<Sheet.Title>{m.uploadDocument_sheet_title()}</Sheet.Title>
			<Sheet.Description>{m.uploadDocument_sheet_description()}</Sheet.Description>
		</Sheet.Header>
		<form
			id="form"
			method="POST"
			use:enhance
			action={route("uploadDocument /documents")}
			class="mt-6 mb-6 space-y-4"
			enctype="multipart/form-data"
		>
			<Form.Field {form} name="category">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>{m.uploadDocument_sheet_form_documentKategorieLabel()}</Form.Label>
						<Select.Root type="single" bind:value={$formData.category} name={props.name}>
							<Select.Trigger {...props}>
								{$formData.category
									? uploadCategories.find((v) => v.value == $formData.category)?.name
									: "Kategorie auswählen"}
							</Select.Trigger>
							<Select.Content>
								{#each uploadCategories as category}
									<Select.Item value={category.value} label={category.name} />
								{/each}
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
				<Form.Description>
					{m.uploadDocument_sheet_form_documentKategorieDescription()}
				</Form.Description>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="date">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>{m.uploadDocument_sheet_form_creationDate_label()}</Form.Label>
						<Popover.Root>
							<Popover.Trigger
								{...props}
								class={cn(
									buttonVariants({ variant: "outline" }),
									"w-full justify-start pl-4 text-left font-normal",
									!dateValue && "text-muted-foreground"
								)}
							>
								{dateValue
									? df.format(dateValue.toDate(getLocalTimeZone()))
									: m.uploadDocument_sheet_form_creationDate_pickADate()}
								<CalendarIcon class="ml-auto size-4 opacity-50" />
							</Popover.Trigger>
							<Popover.Content class="w-auto p-0" side="top">
								<CalendarYearMonth
									locale={getLocale()}
									type="single"
									value={dateValue as DateValue}
									bind:placeholder={datePlaceholder}
									minValue={new CalendarDate(1900, 1, 1)}
									maxValue={today(getLocalTimeZone())}
									calendarLabel="Erstellungsdatum"
									onValueChange={(v) => {
										if (v) {
											$formData.date = v.toString();
										} else {
											$formData.date = "";
										}
									}}
								/>
							</Popover.Content>
						</Popover.Root>
						<Form.Description
							>{m.uploadDocument_sheet_form_creationDate_description()}</Form.Description
						>
						<Form.FieldErrors />
						<input hidden value={$formData.date} name={props.name} />
					{/snippet}
				</Form.Control>
			</Form.Field>
			<Form.Field {form} name="file">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>{m.uploadDocument_sheet_form_document_label()}</Form.Label>
						<FileInput {...props} bind:files={$file} accept="application/pdf" />
					{/snippet}
				</Form.Control>
				<Form.Description>{m.uploadDocument_sheet_form_document_description()}</Form.Description>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Button type="submit" class="w-full" disabled={$delayed}>
				{#if $delayed}<Loader class="mr-3 size-4" />
				{:else}<Upload class="mr-3 size-4" />
				{/if}
				{m.uploadDocument_sheet_form_submit()}
			</Form.Button>
		</form>
		<!-- <Sheet.Footer>
			<SuperDebug data={$formData} />
		</Sheet.Footer> -->
	</Sheet.Content>
</Sheet.Root>
