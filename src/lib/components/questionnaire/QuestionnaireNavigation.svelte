<script lang="ts">
	import { cn } from "$lib/utils";

	import * as m from "$lib/paraglide/messages";

	import Button from "$ui/button/button.svelte";

	import ArrowLeft from "lucide-svelte/icons/arrow-left";
	import ArrowRight from "lucide-svelte/icons/arrow-right";

	interface Props {
		previousDisabled: boolean;
		previous: () => void;
		nextDisabled: boolean;
		next: () => void;
		class?: string;
	}

	let { previousDisabled, previous, nextDisabled, next, class: classes }: Props = $props();
</script>

<div class={cn("flex items-start justify-between", classes)}>
	<Button variant="outline" disabled={previousDisabled} onclick={previous}>
		<ArrowLeft class="h-4 w-4" />
		{m.questionnaire_previous()}
	</Button>

	<Button variant="default" disabled={nextDisabled} onclick={next}>
		{m.questionnaire_next()}
		<ArrowRight class="h-4 w-4" />
	</Button>
</div>
