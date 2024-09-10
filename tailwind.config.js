import flowbite from 'flowbite/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}', './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'],

  plugins: [
    require('@tailwindcss/forms'),
    flowbite
  ],

  darkMode: 'class',
  theme: {
    extend: {
      colors: {
				// flowbite-svelte
				primary: {
					50: '#d1f5ec',
					100: '#c0ece1',
					200: '#b0e4d6',
					300: '#9fdbca',
					400: '#8ed2bf',
					500: '#7ecab3',
					600: '#6dc1a7',
					700: '#5bb89c',
					800: '#48b090',
					900: '#32a784',
					950: '#109e78'
				},
				gray: {
					50: '#F2F2F3',
					100: '#E5E5E6',
					200: '#C8C8CB',
					300: '#AEAEB2',
					400: '#949499',
					500: '#7A7A80',
					600: '#616166',
					700: '#4B4B4E',
					800: '#323234',
					900: '#19191A',
					950: '#0C0C0D'
				}
			}

    }
  }
}

