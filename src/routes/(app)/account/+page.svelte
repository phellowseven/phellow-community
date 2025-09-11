<script module lang="ts">
	import * as m from "$lib/paraglide/messages";
	export function getPageTitle() {
		return m.account_title();
	}
</script>

<script lang="ts">
	import type { PageData } from "./$types";
	import AppLayout from "../_appLayout.svelte";

	import { route } from "$lib/ROUTES";

	import { headPageTitle } from "$lib/utils";

	import { Button } from "$ui/button";

	import InfoRow from "$components/InfoRow.svelte";

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{headPageTitle(m.account_title())}</title>
</svelte:head>

<AppLayout>
	{#snippet children()}
		<section>
			<h1 class="mb-2 md:mb-4">{m.account_title()}</h1>

			<p class="text-muted-foreground">{m.account_description()}</p>
		</section>
		{#if data.user.email || data.user.name || data.user.username}
			<section class="flex flex-col gap-4">
				<h2 class="mb-1 md:mb-2">{m.account_user()}</h2>

				{#if data.user.name}
					<InfoRow id="name" label={m.account_user_name()} value={data.user.name} />
				{/if}
				{#if data.user.username}
					<InfoRow id="username" label={m.account_user_username()} value={data.user.username} />
				{/if}
				{#if data.user.email}
					<InfoRow id="email" label={m.account_user_email()} value={data.user.email} />
				{/if}
			</section>
		{/if}

		<section>
			<h2 class="mb-1 md:mb-2">{m.account_security()}</h2>

			<form
				action={route("logoutEverywhere /account")}
				method="post"
				class="flex flex-col items-start space-y-2"
			>
				<Button type="submit" id="logoutEverywhere" variant="destructive"
					>{m.account_logout_everywhere()}</Button
				>
				<p class="text-muted-foreground text-sm">
					{m.account_logout_description()}
				</p>
			</form>
		</section>
	{/snippet}
</AppLayout>
