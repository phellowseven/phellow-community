<!-- src/lib/components/ProgressIndicator.svelte -->
<script lang="ts">
	import * as m from "$lib/paraglide/messages";

	import { Progress } from "$ui/progress";

	interface Props {
		currentIndex: number;
		totalSteps: number;
		answers: Map<string, any>;
	}

	let { currentIndex, totalSteps, answers }: Props = $props();

	let { progress, completedSteps, completionRate } = $derived.by(() => {
		const progress = (currentIndex / (totalSteps - 1)) * 100;
		const completedSteps = answers.size;
		const completionRate = (completedSteps / totalSteps) * 100;

		return { progress, completedSteps, completionRate };
	});
</script>

<div>
	<!-- Step counter -->
	<div class="mb-2 flex items-center justify-between text-muted-foreground">
		<div class="text-sm">
			{m.questionnaire_progress_steps({ current: currentIndex + 1, total: totalSteps })}
		</div>
	</div>

	<!-- Progress bar -->
	<Progress value={progress} />
</div>
