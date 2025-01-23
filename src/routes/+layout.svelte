<script lang="ts">
	import { i18n } from "$lib/i18n";
	import { ParaglideJS } from "@inlang/paraglide-sveltekit";
	import "../app.css";
	import { languageTag, onSetLanguageTag } from "$lib/paraglide/runtime";
	import dayjs from "dayjs";
	import localizedFormat from "dayjs/plugin/localizedFormat";
	import { ModeWatcher } from "mode-watcher";
	import { onMount } from "svelte";
	import { browser } from "$app/environment";

	let { children } = $props();

	const locales: Record<string, () => Promise<any>> = {
		de: () => import("dayjs/locale/de"),
		en: () => import("dayjs/locale/en"),
	};

	if (browser) {
		onSetLanguageTag((newLanguageTag) => {
			locales[newLanguageTag]().then(() => dayjs.locale(newLanguageTag));
		});
	}

	dayjs.extend(localizedFormat);

	onMount(() => {
		const currentLanguage = languageTag();
		locales[currentLanguage]().then(() => dayjs.locale(currentLanguage));
	});
</script>

<ModeWatcher />
<ParaglideJS {i18n}>
	{@render children()}
</ParaglideJS>
