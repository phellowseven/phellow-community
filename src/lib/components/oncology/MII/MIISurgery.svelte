<script lang="ts">
	import Histology from "./Details/Histology/Histology.svelte";
	import TnmDisplay from "../TNMDisplay.svelte";

	import type { TNMStaging } from "$lib/types/oncology_types";
	import Surgery from "./Details/Surgery/Surgery.svelte";

	interface Props {
		staging: TNMStaging;
	}

	let { staging }: Props = $props();
</script>

<Surgery />
<TnmDisplay {staging} />
<Histology />
