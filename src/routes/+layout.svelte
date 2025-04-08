<script lang="ts">
	import "../app.css";
	import dayjs from "dayjs";
	import localizedFormat from "dayjs/plugin/localizedFormat";
	import { ModeWatcher } from "mode-watcher";
	import { browser } from "$app/environment";
	import { getLocale, overwriteGetLocale, overwriteSetLocale } from "$lib/paraglide/runtime";

	let { children } = $props();

	let locale = $state(getLocale());

	const dayJsFormats: Record<string, () => Promise<any>> = {
		de: () => import("dayjs/locale/de"),
		en: () => import("dayjs/locale/en"),
	};

	dayjs.extend(localizedFormat);

	overwriteGetLocale(() => locale);
	overwriteSetLocale((newLocale) => {
		if (browser) {
			dayJsFormats[newLocale]().then(() => {
				dayjs.locale(newLocale);
			});
		}
		locale = newLocale;
	});
</script>

<ModeWatcher />

{#key locale}
	{@render children()}
{/key}
