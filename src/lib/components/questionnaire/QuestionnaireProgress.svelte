<!-- src/lib/components/ProgressIndicator.svelte -->
<script lang="ts">
	import { Progress } from "$ui/progress";

	import CheckCircle from "lucide-svelte/icons/check-circle";

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
			Step {currentIndex + 1} of {totalSteps}
		</div>
		<div class="flex items-center gap-2 text-sm">
			<!-- <CheckCircle class="h-4 w-4 text-primary" />
			{completedSteps} of {totalSteps} completed -->
		</div>
	</div>

	<!-- Progress bar -->
	<Progress value={progress} />
</div>
