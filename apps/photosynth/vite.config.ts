import { defineConfig } from "vite"
import { viteConvertPugInHtml } from '@mish.dev/vite-convert-pug-in-html'
import { resolve } from 'path'
import packageJSON from './package.json'

const instruments:string[] = []

// We can pass whatever JS vars we want into the template
// by adding it here to locals
// we mainly use this for dates and versions
// but it is also handy for connecting together other data
export default defineConfig({
	clearScreen: false,
	plugins: [
		viteConvertPugInHtml({
			locals: {
				CURRENT_YEAR: new Date().getFullYear(),
				package:packageJSON,
				instrumentNames:instruments,
				instruments:instruments.map( instrument => `<li>${instrument}</li>` ).join()
			}
		})
	],
	root: "source",
	publicDir: "../public",
	resolve: {
		alias: {
			'@': resolve(__dirname, 'source'),
		},
	},
	build: {
		outDir: "../dist/"
	},
	worker: {
		format: 'es'
	},
	server: {
		port: 909,
		strictPort: true,
		watch: {
			ignored: ["**/source-tauri/**", "**/source-electron/**"]
		}
	}
})