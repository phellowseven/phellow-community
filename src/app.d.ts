// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type { AvailableLanguageTag } from '$lib/paraglide/runtime';
import type { ParaglideLocals } from '@inlang/paraglide-sveltekit';

declare global {
	type Theme = 'dark' | 'light';
	type ThemeSetting = 'system' | Theme;

	namespace App {
		// interface Error {}
		interface Locals {
			user: import('lucia').User | null;
			session: import('lucia').Session | null;
			introspectionSubject: string | null;
			encryptionKey: CryptoKey | null;
			validAccessToken: () => Promise<string>;
			paraglide: ParaglideLocals<AvailableLanguageTag>;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
		namespace Superforms {
			type Message = {
				status: 'error' | 'success';
				text: string;
			};
		}
	}
}

export {};
