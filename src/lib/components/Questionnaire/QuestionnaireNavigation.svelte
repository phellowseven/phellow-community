<script lang="ts">
	import { Icon, ArrowLeft, ArrowRight } from 'svelte-hero-icons';
	import { createEventDispatcher } from 'svelte';

	interface NavigationProps {
		currentPage: number;
		totalPages: number;
		progress: number;
		isNextDisabled?: boolean;
		isPrevDisabled?: boolean;
	}

	export let currentPage: NavigationProps['currentPage'];
	export let totalPages: NavigationProps['totalPages'];
	export let progress: NavigationProps['progress'];
	export let isNextDisabled: NavigationProps['isNextDisabled'] = false;
	export let isPrevDisabled: NavigationProps['isPrevDisabled'] = false;

	const dispatch = createEventDispatcher<{
		next: void;
		previous: void;
	}>();

	function handleNext() {
		dispatch('next');
	}

	function handlePrevious() {
		dispatch('previous');
	}
</script>

<div class="w-full space-y-6">
	<!-- Progress bar -->
	<div class="h-2.5 w-full rounded-full bg-gray-200">
		<div
			class="h-2.5 rounded-full bg-blue-500 transition-all duration-300"
			style="width: {progress}%"
		/>
	</div>

	<!-- Navigation buttons -->
	<div class="flex w-full items-center justify-between">
		<button
			class="flex items-center rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
			on:click={handlePrevious}
			disabled={isPrevDisabled || currentPage === 0}
			type="button"
		>
			<Icon src={ArrowLeft} class="mr-2 h-5 w-5" />
			Previous
		</button>

		<div class="text-center">
			<span class="rounded-full bg-gray-100 px-3 py-1 text-sm">
				Page {currentPage + 1} of {totalPages}
			</span>
		</div>

		<button
			class="flex items-center rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
			on:click={handleNext}
			disabled={isNextDisabled || currentPage === totalPages - 1}
			type="button"
		>
			Next
			<Icon src={ArrowRight} class="ml-2 h-5 w-5" />
		</button>
	</div>
</div>
