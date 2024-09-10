import { paraglide } from '@inlang/paraglide-sveltekit/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		paraglide({
			//recommended
			project: './project.inlang',
			outdir: './src/lib/paraglide'
		}),
		sveltekit()
	],
	optimizeDeps: {
		exclude: ['@surrealdb/wasm', 'surrealql.wasm'],
		esbuildOptions: {
			target: 'esnext'
		}
	},
	esbuild: {
		supported: {
			'top-level-await': true
		}
	}
});
