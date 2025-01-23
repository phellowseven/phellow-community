// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { AvailableLanguageTag } from "$lib/paraglide/runtime";
import type { ParaglideLocals } from "@inlang/paraglide-sveltekit";

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: import("$lib/server/db/schema").User | null;
			session: import("$lib/server/db/schema").Session | null;
			encryptionKey: CryptoKey | null;
			validAccessToken: () => Promise<string>;
			paraglide: ParaglideLocals<AvailableLanguageTag>;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
