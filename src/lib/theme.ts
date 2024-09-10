import { browser } from '$app/environment';
import { derived, writable, type Readable } from 'svelte/store';

const setting = writable<ThemeSetting>('system');
const systemTheme = writable<Theme>('light');
export const theme: Readable<Theme> = derived([setting, systemTheme], ([setting, systemTheme]) => {
	if ((setting == 'system' && systemTheme == 'dark') || setting == 'dark') {
		return 'dark';
	} else {
		return 'light';
	}
});

if (browser) {
	setting.set((localStorage.getItem('theme') as Theme) || 'system');
	systemTheme.set(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
		systemTheme.set(e.matches ? 'dark' : 'light');
	});

	setting.subscribe((value) => {
		localStorage.setItem('theme', value);
	});

	theme.subscribe((value) => {
		if (value == 'dark') {
			// Tailwind
			document.body.classList.add('dark');
		} else {
			// Tailwind
			document.body.classList.remove('dark');
		}
	});
}

export default setting;
