<script lang="ts" context="module">
	import type { DrawerType } from './_types';
	import { blur } from 'svelte/transition';
	import { derived, writable, type Readable } from 'svelte/store';

	export const hidden = writable(true);
	export const drawer = writable<DrawerType | null>(null);

	export function open(options: DrawerType) {
		drawer.set(options);
		hidden.set(false);
	}

	export function close() {
		drawer.set(null);
		hidden.set(true);
	}

	export let visible: Readable<boolean> = derived(hidden, (value) => !value);

	function handleKeydown(event: KeyboardEvent) {
		if (event.key == 'Escape') close();
	}
</script>

<script lang="ts">
	import { browser } from '$app/environment';
	import { Drawer } from 'flowbite-svelte';
	import { quadInOut } from 'svelte/easing';
	import { Spinner } from 'flowbite-svelte';

	let transitionParams = {
		x: browser ? window?.innerWidth : 0 + 300,
		duration: 300,
		easing: quadInOut,
		delay: 0
	};

	hidden.subscribe((value) => {
		if (value) $drawer = null;
	});
</script>

<svelte:window on:keydown={handleKeydown} />

{#if $hidden == false}
	<div
		transition:blur={{ duration: 150, easing: quadInOut, amount: 10 }}
		on:transitionend={() => {
			if ($hidden) $drawer = null;
		}}
		class="fixed left-0 top-0 z-40 h-full w-full bg-transparent/50 backdrop-blur-sm"
	/>
{/if}

<Drawer
	class="z-50 w-full overflow-y-auto rounded-xl bg-white p-6 shadow-lg backdrop-blur-xl  md:m-4 md:w-[500px]"
	backdrop={false}
	placement="right"
	transitionType="fly"
	{transitionParams}
	bind:hidden={$hidden}
	id="sidebar1"
>
	<!-- Create Patient -->
	{#if $drawer && $drawer?.type == 'upload-document'}
		{#await import('./UploadDocument.svelte')}
			<div class="flex h-full w-full items-center justify-center">
				<Spinner size="10" />
			</div>
		{:then module}
			{@const drawer = $drawer}

			<svelte:component
				this={module.default}
				data={drawer.data}
				on:close={() => {
					$hidden = true;
				}}
			/>
		{/await}
	{/if}
	<!-- /Create Patient -->
</Drawer>
