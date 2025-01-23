<!-- src/lib/components/questionnaire/items/BooleanQuestion.svelte -->
<script lang="ts">
	import { Button } from "$ui/button";
	import type { ItemComponentInterface } from "./itemComponentInterface";

	interface Props extends ItemComponentInterface<boolean> {}

	let { item, value = undefined, onAnswer }: Props = $props();
</script>

<div class="flex gap-4">
	<Button
		class={[
			value === true
				? "bg-primary text-primary-foreground"
				: "bg-secondary text-secondary-foreground",
		]}
		onclick={() => onAnswer(true)}
	>
		Yes
	</Button>
	<Button
		class={[
			value === false
				? "bg-primary text-primary-foreground"
				: "bg-secondary text-secondary-foreground",
		]}
		onclick={() => onAnswer(false)}
	>
		No
	</Button>
</div>
