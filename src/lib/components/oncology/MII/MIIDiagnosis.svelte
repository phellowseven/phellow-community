<script lang="ts">
	import Diagnosis from "./Details/Diagnosis/Diagnosis.svelte";
	import Fernmetastasen from "./Details/Fernmetastasen/Fernmetastasen.svelte";
	import Histology from "./Details/Histology/Histology.svelte";
	import TnmDisplay from "../TNMDisplay.svelte";

	import type { TNMStaging } from "$lib/types/oncology_types";

	interface Props {
		staging: TNMStaging;
	}

	let { staging }: Props = $props();
</script>

<Diagnosis />
<TnmDisplay {staging} />
<Histology />
<Fernmetastasen />
