<script lang="ts">
	import type { QuestionnaireItem } from 'fhir/r4';

	export let item: QuestionnaireItem;
</script>

<div class="py-2">
	<h3 class="text-lg font-semibold text-gray-800">{item.text}</h3>
</div>
