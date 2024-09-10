<script lang="ts">
	import { Button, P } from 'flowbite-svelte';
	import Logo from '$components/logo/phellow community_white-vertical.svelte';
	import { enhance } from '$app/forms';

	import * as m from '$lib/paraglide/messages';
</script>

<div class="flex min-h-full flex-col justify-center bg-gray-800 px-6 py-12 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-sm">
		<div class="flex justify-center">
			<Logo class="" />
		</div>
		<!-- <P tag="h4" class="mt-12 text-center text-2xl font-bold leading-tight" color="text-white">
			<span class="font-normal">{m.login_sign_in_to()}</span>
			<span class="logo-text">
				<span>phellow</span>
			</span>
			<span class="text-gray-400">community</span>
		</P> -->
	</div>

	<div class="sm:mx-auto sm:w-full sm:max-w-sm">
		<form class="" method="POST" action="?/login" use:enhance>
			<input type="hidden" value="fusion-auth" />

			<div>
				<Button type="submit" class="w-full">{m.login_sign_in_button()}</Button>
			</div>
		</form>
	</div>
</div>
