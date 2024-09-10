<script lang="ts">
	import StickyHeader from '$components/StickyHeader.svelte';
	import { pageTitle } from '$lib/util';
	import { Heading, P, Secondary } from 'flowbite-svelte';
	import { blur } from 'svelte/transition';
	import * as m from '$lib/paraglide/messages';
</script>

<svelte:head>
	<title>{pageTitle(m.tasks_title())}</title>
</svelte:head>

<div in:blur={{ duration: 200 }} class="my-8">
	<StickyHeader>
		<div class="flex items-start justify-between lg:flex-row">
			<P class="text-3xl font-extrabold">{m.tasks_title()}</P>
		</div>
	</StickyHeader>

	<div class="mt-48 flex justify-center text-center">
		<div>
			<Heading class="text-2xl font-bold">{m.no_content()}</Heading>
			<Secondary class="text-xl font-medium">{m.no_content_description()}</Secondary>
		</div>
	</div>
</div>
