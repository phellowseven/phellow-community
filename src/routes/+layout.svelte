<script lang="ts">
	import '../app.postcss';
	// import '$lib/theme';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import { i18n } from '$lib/i18n.js';
	import { onSetLanguageTag } from '$lib/paraglide/runtime';
	import dayjs from 'dayjs';

	const locales: Record<string, () => Promise<any>> = {
		de: () => import('dayjs/locale/de'),
		en: () => import('dayjs/locale/en')
	};

	onSetLanguageTag((newLanguageTag) => {
		locales[newLanguageTag]().then(() => dayjs.locale(newLanguageTag));
	});
</script>

<ParaglideJS {i18n}>
	<slot />
</ParaglideJS>
