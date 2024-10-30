<script context="module" lang="ts">
	import { writable } from 'svelte/store';

	export const hidden = writable(true);

	export function toggle() {
		hidden.update((value) => !value);
	}
</script>

<script lang="ts">
	import {
		Avatar,
		Drawer,
		P,
		Sidebar,
		SidebarGroup,
		SidebarItem,
		SidebarWrapper
	} from 'flowbite-svelte';
	import {
		Icon,
		ArrowRightOnRectangle,
		Cog,
		Home,
		Document,
		Calendar,
		QuestionMarkCircle,
		ArrowTopRightOnSquare,
		QueueList,
		DocumentPlus
	} from 'svelte-hero-icons';
	import { quadInOut } from 'svelte/easing';
	import { blur } from 'svelte/transition';
	import { afterNavigate } from '$app/navigation';
	import type { User } from 'lucia';
	import PhellowCommunity from './logo/phellow.community_text.svelte';
	import * as m from '$lib/paraglide/messages';

	let width: number;

	export let mobileMenu: boolean = $hidden;
	export let path: string;
	export let user: User | null;

	$: isMobile = width < 1024 ? true : false;
	$: $hidden = isMobile ? $hidden : false;

	hidden.subscribe((value) => (mobileMenu = !value));

	afterNavigate(() => {
		if (isMobile) $hidden = true;
	});
</script>

<svelte:window bind:innerWidth={width} />

{#if isMobile && $hidden == false}
	<div
		transition:blur|local={{ duration: 200, easing: quadInOut }}
		class="fixed left-0 top-0 z-40 h-full w-full bg-transparent/50 backdrop-blur-sm"
	/>
{/if}

<Drawer
	transitionType="fly"
	transitionParams={{ x: -280, duration: 300 }}
	bind:hidden={$hidden}
	backdrop={false}
	class="z-50 w-[280px] overflow-hidden rounded-e-lg border-r bg-transparent !p-0 lg:max-h-screen lg:rounded-none"
	activateClickOutside={true}
>
	<Sidebar asideClass="w-full h-full" activeUrl={path}>
		<SidebarWrapper
			class="flex h-full w-[280px] flex-col justify-between rounded-none bg-white px-0 py-6"
		>
			<div class="px-4">
				<div class="mb-10 inline-flex w-full">
					<div class="inline-flex items-center space-x-3">
						<span aria-hidden class="mx-4 mt-4">
							<PhellowCommunity />
						</span>
						<h1 class="sr-only">phellow community</h1>
					</div>
				</div>

				<SidebarGroup>
					<SidebarItem href="/dashboard" label={m.dashboard_title()}>
						<svelte:fragment slot="icon">
							<i><Icon solid src={Home} color="currentColor" class="h-6" /></i>
						</svelte:fragment>
					</SidebarItem>
					<SidebarItem href="/documents" label={m.documents_title()}>
						<svelte:fragment slot="icon">
							<i><Icon solid src={Document} color="currentColor" class="h-6" /></i>
						</svelte:fragment>
					</SidebarItem>
					<SidebarItem href="/appointments" label={m.appointments_title()}>
						<svelte:fragment slot="icon">
							<i><Icon solid src={Calendar} color="currentColor" class="h-6" /></i>
						</svelte:fragment>
					</SidebarItem>
					<SidebarItem href="/tasks" label={m.tasks_title()}>
						<svelte:fragment slot="icon">
							<i><Icon solid src={QueueList} color="currentColor" class="h-6" /></i>
						</svelte:fragment>
					</SidebarItem>
					<SidebarItem href="/anamnesis" label={m.anamnese_title()}>
						<svelte:fragment slot="icon">
							<i><Icon solid src={DocumentPlus} color="currentColor" class="h-6" /></i>
						</svelte:fragment>
					</SidebarItem>
				</SidebarGroup>
			</div>

			<SidebarGroup class="px-4">
				<SidebarItem href="https://example.com" label={m.faqs_title()}>
					<svelte:fragment slot="icon">
						<i><Icon src={QuestionMarkCircle} color="currentColor" class="h-6" /></i>
					</svelte:fragment>
					<svelte:fragment slot="subtext">
						<i class="ml-2"><Icon src={ArrowTopRightOnSquare} color="currentColor" class="h-6" /></i
						>
					</svelte:fragment>
				</SidebarItem>
				<SidebarItem href="/settings" label={m.settings_title()}>
					<svelte:fragment slot="icon">
						<i><Icon src={Cog} class="h-6" /></i>
					</svelte:fragment>
				</SidebarItem>

				<SidebarItem href="/logout" label={m.log_out_button()} data-sveltekit-preload-data="off">
					<svelte:fragment slot="icon">
						<i><Icon src={ArrowRightOnRectangle} class="h-6" variation="outline" /></i>
					</svelte:fragment>
				</SidebarItem>

				{#if user?.username || user?.email}
					<div
						class="mt-6 inline-flex w-full items-center justify-start space-x-4 rounded-lg bg-gray-50 px-3 py-3"
					>
						<Avatar size="sm" border></Avatar>
						<div class="flex w-2/3 flex-col truncate text-ellipsis text-sm">
							{#if user?.username}
								<span class="font-bold">{user.username}</span>
							{:else if user?.email}
								<span id="email" class="truncate text-ellipsis">{user.email}</span>
							{/if}
						</div>
					</div>
				{/if}
			</SidebarGroup>
		</SidebarWrapper>
	</Sidebar>
</Drawer>

<style scoped lang="postcss">
	i {
		@apply text-gray-400;
	}
</style>
