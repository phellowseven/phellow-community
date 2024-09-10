<script lang="ts">
	import { Card } from 'flowbite-svelte';
	import { Calendar, Clock, Icon, MapPin } from 'svelte-hero-icons';
</script>

<Card horizontal={true} size="lg" class="w-full max-w-full">
	<div class="flex w-full animate-pulse flex-col justify-between sm:flex-row sm:space-x-6">
		<div class="mt-2 space-y-4 sm:w-2/3">
			<div class="h-2 w-full rounded bg-[#109b77]/50"></div>
			<div class="flex flex-row items-center justify-start">
				<Icon src={MapPin} class="mr-2 h-6 w-6 shrink-0 text-gray-500/50" />
				<div class="h-2 w-full rounded bg-[#109b77]/50"></div>
			</div>
		</div>
		<div class="flex flex-col items-start space-y-2 sm:w-1/3 sm:items-end">
			<div class="flex w-full flex-row items-center">
				<div class="order-2 flex w-full flex-col sm:order-1">
					<div class="h-2 w-full rounded bg-[#109b77]/50"></div>
				</div>
				<Icon
					src={Calendar}
					class="order-1 ml-0 mr-2 h-6 w-6 shrink-0 text-gray-500/50 sm:order-2 sm:ml-2 sm:mr-0"
				/>
			</div>
			<div class="flex w-full flex-row items-center">
				<div class="h-2 w-full rounded bg-[#109b77]/50"></div>
				<Icon
					src={Clock}
					class="order-1 ml-0 mr-2 h-6 w-6 shrink-0 text-gray-500/50 sm:order-2 sm:ml-2 sm:mr-0"
				/>
			</div>
		</div>
	</div>
</Card>
