<script lang="ts">
	import { fullName } from '$lib/patient';
	import type { Patient } from 'fhir/r4';
	import { P } from 'flowbite-svelte';

	export let patient: Patient;

	$: name = fullName(patient);
</script>

<div
	class="flex flex-col items-start justify-between md:flex-row md:items-start {$$props.class ??
		''} "
>
	<P
		class="mb-4 inline-flex items-center {name.length > 25
			? 'text-2xl'
			: 'text-3xl'} font-extrabold leading-8"
	>
		{name}
	</P>

	<div class="space-x-px align-top">
		<slot name="actions" />
	</div>
</div>
