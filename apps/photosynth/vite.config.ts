import { defineConfig } from "vite"
import { viteConvertPugInHtml } from '@mish.dev/vite-convert-pug-in-html'
import { resolve } from 'path'

export default defineConfig({
	clearScreen: false,
	plugins: [
		viteConvertPugInHtml({
			locals: {
				SITE_NAME: "Photosynth",
				CURRENT_YEAR: new Date().getFullYear(),
			}
		})
	],
	root: "source",
	resolve: {
		alias: {
			'@': resolve(__dirname, 'source'),
		},
	},
	build: {
		outDir: "../dist/"
	},
	server: {
		port: 909,
		strictPort: true,
		watch: {
			ignored: ["**/source-tauri/**"]
		}
	}
})