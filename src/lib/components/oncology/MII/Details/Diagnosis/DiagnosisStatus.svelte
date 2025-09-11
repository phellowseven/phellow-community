<script lang="ts">
	import CheckCircle from "@lucide/svelte/icons/check-circle";
	import AlertCircle from "@lucide/svelte/icons/alert-circle";
	import { twMerge } from "tailwind-merge";

	interface Props {
		verificationStatus: string;
		clinicalStatus: string | undefined;
		class?: string;
	}

	let { verificationStatus, clinicalStatus, class: classes }: Props = $props();
</script>

<div class={twMerge("border-border bg-card rounded-lg border p-4 shadow-xs", classes)}>
	<h3 class="mt-0 mb-2 font-medium md:mb-8">Status</h3>

	<div class="flex flex-col gap-2 md:gap-4">
		<div class="flex items-start gap-2">
			<CheckCircle class="mt-0.5 shrink-0" size={16} />
			<div>
				<div class="font-medium">Klinischer Status</div>
				<div class="text-muted-foreground">{clinicalStatus}</div>
			</div>
		</div>

		<div class="flex items-start gap-2">
			<AlertCircle class="mt-0.5 shrink-0" size={16} />
			<div>
				<div class="font-medium">Diagnosesicherung</div>
				<div class="text-muted-foreground">{verificationStatus}</div>
			</div>
		</div>
	</div>
</div>
