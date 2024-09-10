<script lang="ts">
	import type { Dayjs } from 'dayjs';
	import { Card, P } from 'flowbite-svelte';
	import { Document, Icon } from 'svelte-hero-icons';
</script>

<Card horizontal={true} size="lg" class="w-full max-w-full">
	<div class="flex w-full animate-pulse flex-row items-center">
		<div class="mr-6 h-6 w-6 shrink-0 rounded bg-[#109b77]/50"></div>
		<div class="flex w-full flex-col space-y-4">
			<div class="h-2 rounded bg-[#109b77]/50"></div>
			<div class="flex flex-row space-x-4">
				<div class="h-2 w-1/2 rounded bg-[#109b77]/50"></div>
				<div class="h-2 w-1/2 rounded bg-[#109b77]/50"></div>
			</div>
		</div>
	</div>
</Card>
