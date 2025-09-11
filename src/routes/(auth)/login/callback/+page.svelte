<script lang="ts">
	import { enhance } from "$app/forms";
	import { page } from "$app/state";
	import { onMount } from "svelte";
	import * as m from "$lib/paraglide/messages";

	let form: HTMLFormElement | undefined = $state(undefined);

	onMount(() => {
		form?.submit();
	});
</script>

<div class="flex h-full w-full items-center justify-center">
	<form action="?/login" method="post" bind:this={form} use:enhance>
		<input name="url" type="hidden" value={page.url} />
	</form>
	<h1>{m.loading_logging_in()}</h1>
</div>
