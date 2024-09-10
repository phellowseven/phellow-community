import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import tailwindcss from 'tailwindcss';

const mode = process.env.NODE_ENV;
const dev = mode === 'development';

export default {
	plugins: [
		// Some plugins, like tailwindcss/nesting, need to run before Tailwind,
		tailwindcss(),
		// But others, like autoprefixer, need to run after,
		autoprefixer(),
		!dev && // optimize the code for production
			cssnano({
				preset: 'default'
			})
	]
};
