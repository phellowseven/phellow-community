<script lang="ts">
	import { page } from "$app/state";

	import { mode, userPrefersMode, resetMode, toggleMode } from "mode-watcher";

	import type { User } from "$lib/server/db/schema";
	import * as m from "$lib/paraglide/messages";

	import { Switch } from "$ui/switch";
	import { Button } from "$ui/button";
	import * as Sidebar from "$ui/sidebar";
	import * as DropdownMenu from "$ui/dropdown-menu";

	import Calendar from "lucide-svelte/icons/calendar";
	import ChevronUp from "lucide-svelte/icons/chevron-up";
	import File from "lucide-svelte/icons/file";
	import Globe from "lucide-svelte/icons/globe";
	import House from "lucide-svelte/icons/house";
	import Shell from "lucide-svelte/icons/shell";
	import ListTodo from "lucide-svelte/icons/list-todo";
	import Logout from "lucide-svelte/icons/log-out";
	import Moon from "lucide-svelte/icons/moon";
	import Sun from "lucide-svelte/icons/sun";
	import Check from "lucide-svelte/icons/check";
	import UserIcon from "lucide-svelte/icons/user";
	import FlaskConical from "lucide-svelte/icons/flask-conical";

	import PhellowCommunityText from "./logo/phellow_community_text.svelte";
	import PhellowCommunityTextLight from "./logo/phellow_community_text_light.svelte";
	import { route } from "$lib/ROUTES";
	import { getLocale, locales, localizeHref, setLocale } from "$lib/paraglide/runtime";
	import { goto } from "$app/navigation";

	interface Props {
		user: Omit<User, "id" | "sub"> | null;
		scopes: string[];
	}

	let { user, scopes }: Props = $props();

	let checked: boolean = $state($mode === "dark");
	$effect(() => {
		if ($mode === "dark") {
			checked = true;
		} else {
			checked = false;
		}
	});

	// Menu items.
	const applicationItems: {
		title: string;
		url: string;
		icon: typeof House;
	}[] = [
		{
			title: m.dashboard_title(),
			url: localizeHref(route("/dashboard")),
			icon: House,
		},
		{
			title: m.documents_title(),
			url: localizeHref(route("/documents")),
			icon: File,
		},
		{
			title: m.appointments_title(),
			url: localizeHref(route("/appointments")),
			icon: Calendar,
		},
		{
			title: m.tasks_title(),
			url: localizeHref(route("/tasks")),
			icon: ListTodo,
		},
		{
			title: m.structured_title(),
			url: localizeHref(route("/labs")),
			icon: FlaskConical,
		},
	];

	const moduleItems: {
		title: string;
		url: string;
		icon: typeof House;
	}[] = [
		scopes.includes("module_onco")
			? {
					title: m.module_oncology(),
					url: localizeHref(route("/module/oncology")),
					icon: Shell,
				}
			: null,
	].filter((item) => item !== null);
</script>

<Sidebar.Root variant="floating" class="">
	<Sidebar.Header aria-hidden>
		{#if $mode === "dark"}
			<PhellowCommunityTextLight />
		{:else}
			<PhellowCommunityText />
		{/if}
	</Sidebar.Header>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>{m.appBar_application()}</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each applicationItems as item (item.title)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton isActive={page.url.pathname === item.url}>
								{#snippet child({ props })}
									<a href={item.url} {...props}>
										<item.icon />
										<span>{item.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
		{#if moduleItems.length > 0}
			<Sidebar.Group>
				<Sidebar.GroupLabel>{m.appBar_modules()}</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each moduleItems as item (item.title)}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton isActive={page.url.pathname === item.url}>
									{#snippet child({ props })}
										<a href={item.url} {...props}>
											<item.icon />
											<span>{item.title}</span>
										</a>
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		{/if}
	</Sidebar.Content>
	<Sidebar.Footer>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Sidebar.MenuButton
								{...props}
								class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							>
								{user?.name}
								<ChevronUp class="ml-auto" />
							</Sidebar.MenuButton>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content side="top" class="w-[--bits-dropdown-menu-anchor-width]">
						<DropdownMenu.Sub>
							<DropdownMenu.SubTrigger>
								<Globe class="h-4 w-4" />
								<span>{m.language()}</span>
							</DropdownMenu.SubTrigger>
							<DropdownMenu.SubContent>
								{#each locales as locale (locale)}
									<DropdownMenu.Item
										disabled={locale === getLocale()}
										onclick={() => {
											setLocale(locale);
											const targetURL = localizeHref(page.url.pathname);
											console.log(targetURL);
											goto(targetURL); // { replaceState: true }
										}}
									>
										{#snippet child({ props })}
											<button class="w-full" {...props}>
												{new Intl.DisplayNames([locale], { type: "language" }).of(locale) ?? locale}
												{#if locale === getLocale()}
													<Check />
												{/if}
											</button>
										{/snippet}
									</DropdownMenu.Item>
								{/each}
							</DropdownMenu.SubContent>
						</DropdownMenu.Sub>
						<DropdownMenu.Item>
							{#snippet child({ props })}
								<a href={localizeHref(route("/account"))} class="w-full" {...props}
									><span class="h-4 w-4" aria-hidden="true"><UserIcon /></span
									>{m.account_title()}</a
								>
							{/snippet}
						</DropdownMenu.Item>
						<DropdownMenu.Item>
							{#snippet child({ props })}
								<a data-sveltekit-preload-data="off" href="/logout" class="w-full" {...props}
									><span class="h-4 w-4" aria-hidden="true"><Logout /></span>{m.log_out_button()}</a
								>
							{/snippet}
						</DropdownMenu.Item>
						<DropdownMenu.Item closeOnSelect={false} class="flex items-center">
							<Sun class="h-4 w-4" />
							<Switch bind:checked onclick={toggleMode} />
							<Moon class="h-4 w-4" />
							<span class="sr-only">{m.toggle_theme()}</span>
							{#if $userPrefersMode !== "system"}
								<Button onclick={resetMode}>Reset</Button>
							{/if}
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Footer>
</Sidebar.Root>
