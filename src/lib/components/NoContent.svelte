<script lang="ts">
	import * as m from "$lib/paraglide/messages";
	import { cn } from "$lib/utils";

	interface Props {
		class?: string;
	}

	let { class: classes }: Props = $props();
</script>

<div class={cn("flex w-full items-center justify-center text-center", classes)}>
	<div>
		<h1 class="text-2xl font-bold">{m.no_content()}</h1>
		<p class="text-xl font-medium">{m.no_content_description()}</p>
	</div>
</div>
