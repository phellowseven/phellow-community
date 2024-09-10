<script lang="ts">
	import type { UploadDocumentSchema } from '$lib/document/form';
	import { UploadCategory, uploadCategoryMappings } from '$lib/document/uploadMappings';
	import {
		A,
		Button,
		ButtonGroup,
		CloseButton,
		Dropzone,
		Heading,
		Helper,
		Input,
		InputAddon,
		Label,
		P,
		Select,
		Spinner,
		Tooltip
	} from 'flowbite-svelte';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { Icon, CloudArrowUp, FingerPrint, XMark, DocumentPlus } from 'svelte-hero-icons';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import { superForm } from 'sveltekit-superforms/client';

	export let data: SuperValidated<Infer<UploadDocumentSchema>>;
	// export let patientId: string | null;

	let files: FileList | undefined = undefined;
	let objectURL: string | null = null;

	let uploadCategories = Object.values(UploadCategory)
		.map((val) => ({
			value: val,
			name: val.toUpperCase() // TODO: Translation String here!
		}))
		.sort((a, b) => a.name.localeCompare(b.name));
	let selectedUploadCategory: UploadCategory | undefined = undefined;
	$: if (selectedUploadCategory !== undefined)
		console.log(uploadCategoryMappings[selectedUploadCategory]);

	const dispatch = createEventDispatcher<{ close: void }>();

	const { delayed, errors, enhance, form, constraints } = superForm(data, {
		id: 'upload-document',
		onResult({ result }) {
			if (result.type == 'success') dispatch('close');
		},
		resetForm: true
	});

	$: if ((files?.length || 0) > 0) {
		if (objectURL) URL.revokeObjectURL(objectURL);

		objectURL = URL.createObjectURL(files![0]);
	}

	function clearFileInput() {
		(document.getElementById('file') as HTMLInputElement).value = '';
		files = undefined;
	}
	function onDrop(event: DragEvent) {
		event.preventDefault();

		const dt = event.dataTransfer;

		if (dt?.files?.length == 1 && dt.files[0].type == 'application/pdf') {
			(document.getElementById('file') as HTMLInputElement).files = dt.files;
			files = dt.files;
		}
	}

	function onDragOver(event: DragEvent) {
		event.preventDefault();

		const dt = event.dataTransfer;
		if (dt) event.dataTransfer.dropEffect = 'copy';
	}

	onDestroy(() => {
		if (objectURL) URL.revokeObjectURL(objectURL);
	});

	onMount(() => {
		(document.getElementById('form') as HTMLFormElement).reset();

		const btn = document.querySelector('#dropzone > button') as HTMLButtonElement;
		btn.type = 'button';

		btn.addEventListener('click', (event) => {
			if (event.target == btn) document.getElementById('file')?.click();
		});
	});
</script>

<div class="flex items-center">
	<Heading tag="h4" class="inline-flex items-center font-extrabold">
		<Icon src={DocumentPlus} size="24" solid class="mr-4 text-gray-500" /> Neues Dokument
	</Heading>
	<CloseButton on:click={() => dispatch('close')} class="mb-4 dark:text-white" />
</div>

<form
	id="form"
	method="POST"
	use:enhance
	action="/documents?/uploadDocument"
	class="mb-6 mt-6"
	enctype="multipart/form-data"
>
	<div class="flex flex-col space-y-8">
		<div class="flex flex-col space-y-4">
			<div>
				<Label for="category" class="mb-2">Art des Dokuments</Label>
				<Select class="w-full" items={uploadCategories} bind:value={selectedUploadCategory} />
				<Helper color="red">{$errors.category || ''}</Helper>
			</div>
		</div>

		<div>
			<Label for="date" class="mb-2"
				>Measurement Date <span class="text-xs font-normal opacity-60">optional</span></Label
			>
			<Input
				bind:value={$form.date}
				{...$constraints.date}
				color={$errors.date ? 'red' : 'base'}
				id="date"
				name="date"
				type="date"
			/>
			<Helper color="red">{$errors.date || ''}</Helper>
		</div>

		<div>
			<div class="flex w-full items-center justify-between">
				<Label for="dropzone" class="mb-2"
					>PDF Report <span class="text-xs font-normal opacity-60">optional</span></Label
				>
				{#if files && files.length > 0}
					<button type="button" on:click={clearFileInput} id="new-measurement-remove-pdf">
						<Icon src={XMark} size="20" class="mb-2 mr-1 text-gray-500" />
					</button>
					<Tooltip target="new-measurement-remove-pdf">Remove Document</Tooltip>
				{/if}
			</div>

			<div id="dropzone" class="h-[450px]">
				<Dropzone
					name="file"
					id="file"
					on:dragover={onDragOver}
					on:drop={onDrop}
					bind:files
					accept="application/pdf"
					class="h-full {files ? 'hidden' : ''}"
				>
					<div class="flex flex-col items-center justify-center">
						<Icon src={CloudArrowUp} class="mb-2 text-gray-400" color="currentColor" size="48" />
						<P class="mb-2 text-sm text-gray-500 dark:text-gray-400">
							<span class="font-semibold">Click to upload</span> or drag and drop
						</P>
					</div>
				</Dropzone>

				<A
					on:click={() => document.getElementById('file')?.click()}
					class="{!files
						? 'hidden'
						: 'flex flex-col'} dark:hover:bg-gray-60 h-full w-full grow cursor-pointer rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500"
				>
					<embed src={objectURL} type="application/pdf" class="w-full grow" />
				</A>
			</div>
			{#if $errors.file}<Helper class="mt-2 text-sm" color="red">{$errors.file}</Helper>{/if}
		</div>
	</div>

	<div class="mt-12">
		<Button type="submit" class="w-full">
			{#if $delayed}<Spinner class="mr-3" size="4" color="white" />{/if}
			Hochladen
		</Button>
	</div>
</form>
