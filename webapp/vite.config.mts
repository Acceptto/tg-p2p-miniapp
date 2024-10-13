import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [react()],
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
