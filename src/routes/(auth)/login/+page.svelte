<script lang="ts">
	import LogoDark from "$components/logo/phellow_community_white-vertical.svelte";
	import LogoLight from "$components/logo/phellow_community_vertical.svelte";
	import { mode } from "mode-watcher";
	import { enhance } from "$app/forms";

	import * as m from "$lib/paraglide/messages";
	import { Button } from "$ui/button";
	import { route } from "$lib/ROUTES";
	import { headPageTitle } from "$lib/utils";
	const action = route("login /login");
</script>

<svelte:head>
	<title>{headPageTitle(m.title_login())}</title>
</svelte:head>

<div class="bg-background flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-sm">
		<div class="flex justify-center">
			{#if mode.current === "light"}
				<LogoLight class="" />
			{:else}
				<LogoDark class="" />
			{/if}
		</div>
	</div>

	<div class="sm:mx-auto sm:w-full sm:max-w-sm">
		<form class="" method="POST" {action} use:enhance>
			<div>
				<Button data-testid="login_button" type="submit" class="w-full"
					>{m.login_sign_in_button()}</Button
				>
			</div>
		</form>
	</div>
</div>
