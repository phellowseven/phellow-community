<!-- src/lib/components/questionnaire/items/DateQuestion.svelte -->
<script lang="ts">
	import type { ItemComponentInterface } from "./itemComponentInterface";

	import { Time } from "@internationalized/date";

	import TimePicker from "$components/ui/time-picker/time-picker.svelte";

	let { item, value = undefined, onAnswer }: ItemComponentInterface<Time | undefined> = $props();

	// svelte-ignore state_referenced_locally
	let time = $state(
		// svelte-ignore state_referenced_locally
		new Time(value?.hour ?? 0, value?.minute ?? 0)
	);

	function setTime(time: Time) {
		time = time?.set({
			minute: time.minute,
			hour: time.hour,
			second: time.second,
		});

		onAnswer(time);
	}
</script>

<div class="flex flex-col gap-2">
	<TimePicker
		view="dotted"
		bind:time
		setTime={(time) => {
			time && setTime(time);
		}}
	/>
</div>
