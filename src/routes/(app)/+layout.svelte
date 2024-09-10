<script lang="ts">
	import NavigationMenu, { toggle } from '$components/NavigationMenu.svelte';
	import { Button, Footer, FooterCopyright, FooterLink, FooterLinkGroup } from 'flowbite-svelte';
	import Drawer, { visible } from '$components/Drawer/Drawer.svelte';
	import { blur } from 'svelte/transition';
	import { quartInOut } from 'svelte/easing';
	import { Icon, Bars3 } from 'svelte-hero-icons';
	import { scrollY } from '$lib/scroll';
	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { LayoutData } from './$types';
	import { onDestroy, onMount } from 'svelte';
	import dayjs from 'dayjs';
	import * as m from '$lib/paraglide/messages';

	export let data: LayoutData;

	let overflow: HTMLDivElement;
	let sessionInterval: NodeJS.Timeout;

	$: positionClasses = $visible ? 'md:scale-[90%]' : '';

	function onScroll(_event: Event) {
		$scrollY = overflow.scrollTop;
	}

	afterNavigate(() => {
		overflow.scrollTop = $scrollY;
	});

	onMount(() => {
		sessionInterval = setInterval(() => {
			if (dayjs(data.expiresAt).isBefore(dayjs())) goto('/login');
		}, 1000);
	});

	onDestroy(() => {
		clearInterval(sessionInterval);
	});
</script>

<Drawer />

<div class="flex h-screen overflow-y-auto scroll-smooth transition-all {positionClasses}">
	<div class="fixed left-0 right-0 top-0 z-40 !p-2 lg:hidden">
		<Button on:click={toggle} outline class="m-2"><Icon src={Bars3} size="24" /></Button>
	</div>

	<NavigationMenu path={$page.url.pathname} user={data.user} />

	<div
		bind:this={overflow}
		on:scroll={onScroll}
		class="z-0 flex w-full grow flex-col overflow-y-auto bg-gray-50 lg:ml-[280px]"
	>
		<div
			in:blur|local={{ duration: 200, easing: quartInOut }}
			class="container relative mx-auto mt-16 max-w-5xl flex-grow px-4 sm:px-6 lg:mt-0 lg:px-8"
		>
			<slot />
		</div>

		<Footer class="flex w-full justify-between rounded-none bg-transparent p-4 shadow-none ">
			<FooterCopyright by="phellow seven GmbH." year={new Date().getFullYear()} />
			<FooterLinkGroup ulClass="flex flex-wrap items-center mt-3 text-sm text-gray-500 sm:mt-0">
				<FooterLink href="/privacy">{m.footer_privacy()}</FooterLink>
				<FooterLink href="/imprint">{m.footer_imprint()}</FooterLink>
			</FooterLinkGroup>
		</Footer>
	</div>
</div>
