<script lang="ts">
	import * as Table from "$ui/table";

	export interface MetadataEntry {
		title: string;
		value: string;
	}

	interface Props {
		metadata: MetadataEntry[];
	}

	let { metadata }: Props = $props();
</script>

<Table.Root>
	<Table.Body>
		{#each metadata as entry}
			<Table.Row>
				<Table.Cell class="font-bold">{entry.title}</Table.Cell>
				<Table.Cell>{entry.value}</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>
