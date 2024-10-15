import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';

export default defineConfig({
	plugins: [react()],
	css: {
		postcss: {
			plugins: [tailwindcss(), autoprefixer()],
		},
	},
	build: {
		target: 'esnext',
		minify: 'esbuild',
		cssCodeSplit: false,
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ['react', 'react-dom'],
				},
			},
		},
	},
	esbuild: {
		jsx: 'automatic',
		legalComments: 'none',
	},
	resolve: {
		alias: {
			'@': '/src',
		},
	},
});
