<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import NoContent from "$lib/components/NoContent.svelte";

	// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
	const { Story } = defineMeta({
		title: "Components/NoContent",
		component: NoContent,
		tags: ["autodocs"],
		argTypes: {
			class: { control: "text" },
		},
		parameters: {
			// More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
			layout: "centered",
		},
	});
</script>

<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->
<Story name="Default" />

<Story name="With Custom Class" args={{ class: "bg-gray-100 p-8 rounded-lg" }} />

<Story name="Fullscreen" args={{ class: "min-h-screen" }} />
