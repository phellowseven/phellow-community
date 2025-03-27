<script lang="ts">
	import { page } from "$app/state";
	import { i18n } from "$lib/i18n";
	import * as Breadcrumb from "$ui/breadcrumb";
	import { onMount } from "svelte";
	import { Breadcrumbs } from "svelte-breadcrumbs";

	let routeModules = $state({});

	onMount(async () => {
		routeModules = import.meta.glob("/src/routes/**/*.svelte", {
			eager: true,
		});
	});

	function removeLanguageTagFromURL(pathname: string): URL {
		const url = new URL(page.url.toString());
		url.pathname = i18n.route(pathname);
		return url;
	}
</script>

<Breadcrumbs
	url={removeLanguageTagFromURL(page.url.pathname)}
	routeId={page.route.id}
	pageData={page.data}
	bind:routeModules
	skipRoutesWithNoPage={false}
>
	{#snippet children({ crumbs })}
		{#await crumbs then resolvedCrumbs}
			<Breadcrumb.Root>
				<Breadcrumb.List>
					{#each resolvedCrumbs as crumb, i}
						{#if i == resolvedCrumbs.length - 1}
							<Breadcrumb.Item>
								<Breadcrumb.Link href={crumb.url}>{crumb.title}</Breadcrumb.Link>
							</Breadcrumb.Item>
						{:else}
							<Breadcrumb.Item>
								<Breadcrumb.Link href={crumb.url}>{crumb.title}</Breadcrumb.Link>
							</Breadcrumb.Item>
							<Breadcrumb.Separator />
						{/if}
					{/each}
				</Breadcrumb.List>
			</Breadcrumb.Root>
		{/await}
	{/snippet}
</Breadcrumbs>
