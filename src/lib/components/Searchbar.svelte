<script lang="ts">
	import Search from "lucide-svelte/icons/search";
	import { Input } from "$ui/input";

	interface Props {
		value: string;
		class?: string;
	}

	let { value = $bindable(), class: classes, ...props }: Props = $props();
</script>

<div {...props} class={classes}>
	<label for="search" class="sr-only">Search</label>
	<div class="relative">
		<div class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
			<Search class="h-4 w-4" aria-hidden="true" />
		</div>
		<Input
			type="search"
			id="search"
			bind:value
			placeholder="Search"
			class="block w-full bg-card p-4 ps-10"
		/>
	</div>
</div>
