<script lang="ts">
	import { page } from "$app/state";
	import { Button } from "$components/ui/button";
	import { route } from "$lib/ROUTES";
	import * as m from "$lib/paraglide/messages";
</script>

<main class=" flex min-h-screen flex-col items-center justify-center px-6 py-24 sm:py-32 lg:px-8">
	<div class="flex flex-col space-y-8 text-center">
		<h1>{page.status}</h1>
		{#if page.status === 404}
			<h2 class="border-b-0">{m.error_404_heading()}</h2>
			<p class="text-xl text-muted-foreground">
				{m.error_404_body()}
			</p>
		{:else if page.error}
			<h2 class="border-b-0">{page.error?.message}</h2>
		{/if}
		<div class="flex flex-col items-center justify-center space-y-6">
			<Button href={route("/")} class="">{m.error_go_home()}</Button>
			<a href="/" class="text-sm font-semibold"
				>{m.error_contact_support()} &nbsp;<span aria-hidden="true">&rarr;</span></a
			>
		</div>
	</div>
</main>
