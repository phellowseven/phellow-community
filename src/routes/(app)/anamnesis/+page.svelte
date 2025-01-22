<script lang="ts">
	import StickyHeader from '$components/StickyHeader.svelte';
	import { pageTitle } from '$lib/util';
	import { Heading, P, Secondary } from 'flowbite-svelte';
	import { blur } from 'svelte/transition';
	import * as m from '$lib/paraglide/messages';
	import QuestionnaireForm from '$components/Questionnaire/QuestionnaireForm.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>{pageTitle(m.anamnesis_title())}</title>
</svelte:head>

<div in:blur={{ duration: 200 }} class="my-8">
	<StickyHeader>
		<div class="flex items-start justify-between lg:flex-row">
			<P class="text-3xl font-extrabold">{m.anamnesis_title()}</P>
		</div>
	</StickyHeader>

	<div class="flex">
		<!-- <div>
			<Heading class="text-2xl font-bold">{m.no_content()}</Heading>
			<Secondary class="text-xl font-medium">{m.no_content_description()}</Secondary>
		</div> -->
		{#await data.questionnaire}
			<p>Loading…</p>
		{:then questionnaire}
			<QuestionnaireForm resource={questionnaire} />
		{/await}
	</div>
</div>
