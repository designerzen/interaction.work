import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { viteConvertPugInHtml } from '@mish.dev/vite-convert-pug-in-html'
import { resolve } from 'path'
import packageJSON from './package.json'

const instruments: string[] = []

export default defineConfig({
	main: {
		plugins: [externalizeDepsPlugin()],
		build: {
			outDir: 'dist-electron/main',
			rollupOptions: {
				input: {
					index: resolve(__dirname, 'source-electron/main.ts'),
				},
			},
		},
	},
	preload: {
		plugins: [externalizeDepsPlugin()],
		build: {
			outDir: 'dist-electron/preload',
			rollupOptions: {
				input: {
					index: resolve(__dirname, 'source-electron/preload.ts'),
				},
			},
		},
	},
	renderer: {
		plugins: [
			viteConvertPugInHtml({
				locals: {
					CURRENT_YEAR: new Date().getFullYear(),
					package: packageJSON,
					instrumentNames: instruments,
					instruments: instruments.map((instrument) => `<li>${instrument}</li>`).join(),
				},
			}),
		],
		root: 'source-electron',
		publicDir: 'public',
		resolve: {
			alias: {
				'@': resolve(__dirname, 'source'),
			},
		},
		worker: {
			format: 'es',
		},
		build: {
			outDir: 'dist',
			rollupOptions: {
				input: {
					index: resolve(__dirname, 'source-electron/index.html'),
				},
			},
		},
		server: {
			port: 909,
			strictPort: true,
			watch: {
				ignored: ['**/source-tauri/**'],
			},
		},
	},
})
