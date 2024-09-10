<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let form: HTMLFormElement;

	onMount(() => {
		form.submit();
	});
</script>

<form action="?/login" method="post" bind:this={form} use:enhance>
	<input name="url" type="hidden" value={$page.url} />
</form>
