import { paraglideVitePlugin } from "@inlang/paraglide-js";
import { sveltekit } from "@sveltejs/kit/vite";
import { kitRoutes } from "vite-plugin-kit-routes";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [
		sveltekit(),
		paraglideVitePlugin({
			project: "./project.inlang",
			outdir: "./src/lib/paraglide",
			strategy: ["url", "cookie", "baseLocale"],
		}),
		kitRoutes(),
	],

	test: {
		include: ["src/**/*.{test,spec}.{js,ts}"],
	},
	optimizeDeps: {
		exclude: ["@pdfslick/core"],
	},
});
