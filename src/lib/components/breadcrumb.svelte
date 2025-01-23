<script lang="ts">
	import { page } from "$app/state";
	import * as Breadcrumb from "$ui/breadcrumb";
	import { Breadcrumbs } from "svelte-breadcrumbs";
</script>

<Breadcrumbs
	url={page.url}
	routeId={page.route.id}
	pageData={page.data}
	skipRoutesWithNoPage={false}
>
	{#snippet children({ crumbs })}
		<Breadcrumb.Root>
			<Breadcrumb.List>
				{#each crumbs as crumb, i}
					{#if i == crumbs.length - 1}
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
	{/snippet}
</Breadcrumbs>
