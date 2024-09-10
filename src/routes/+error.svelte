<script lang="ts">
	import { A, Button, Heading, P, Secondary } from 'flowbite-svelte';
</script>

<main
	class=" flex min-h-screen flex-col items-center justify-center bg-white px-6 py-24 sm:py-32 lg:px-8"
>
	<div class="text-center">
		<Heading class="mb-4 text-base font-semibold text-primary-700 dark:text-primary-500"
			>404</Heading
		>
		<Heading tag="h1" class="mb-4">Page not found</Heading>
		<Secondary class="text-base">Sorry, we couldn’t find the page you’re looking for.</Secondary>
		<div class="mt-10 flex items-center justify-center gap-x-6">
			<Button
				href="/dashboard"
				class="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
				>Go back home</Button
			>
			<A href="#" class="text-sm font-semibold text-gray-900"
				>Contact support &nbsp;<span aria-hidden="true">&rarr;</span></A
			>
		</div>
	</div>
</main>
