<script lang="ts">
	import { onMount } from "svelte";
	import type { Location } from "fhir/r4";

	interface Props {
		location: Location;
	}

	let { location }: Props = $props();

	let showMap = $state(false);

	// Components that will be dynamically imported
	let Map: any = $state();
	let TileLayer: any = $state();
	let Marker: any = $state();

	onMount(async () => {
		// Dynamic import to ensure this only happens in browser
		const sveaflet = await import("sveaflet");
		Map = sveaflet.Map;
		TileLayer = sveaflet.TileLayer;
		Marker = sveaflet.Marker;
		showMap = true;
	});
</script>

{#if location.position && showMap}
	<div id="map" class="clip z-0 min-h-[300px] flex-1 overflow-hidden rounded-b-lg">
		<Map
			options={{
				center: [location.position.latitude, location.position.longitude],
				zoom: 17,
			}}
		>
			<TileLayer url={"https://tile.openstreetmap.org/{z}/{x}/{y}.png"} />
			<Marker latLng={[location.position.latitude, location.position.longitude]} />
		</Map>
	</div>
{:else}
	<div class="flex min-h-[300px] flex-1 items-center justify-center rounded-b-lg text-gray-500">
		Loading map...
	</div>
{/if}
