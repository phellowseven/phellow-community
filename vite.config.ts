import { paraglide } from "@inlang/paraglide-sveltekit/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { kitRoutes } from "vite-plugin-kit-routes";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [
		sveltekit(),
		paraglide({
			project: "./project.inlang",
			outdir: "./src/lib/paraglide",
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
