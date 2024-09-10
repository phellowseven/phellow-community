<script lang="ts">
	import { scrollY } from '$lib/scroll';
	$: border = $scrollY > 70 ? 'border-b' : 'border-none';
</script>

<div
	id="sticky"
	class="sticky top-0 z-20 -mx-4 my-12 transition-all ease-linear sm:-mx-6 lg:-mx-8 {border} border-gray-200/70 bg-transparent px-4 py-6 backdrop-blur-md sm:px-6 lg:px-8"
>
	<div class="ml-24 lg:ml-0">
		<slot />
	</div>
</div>
