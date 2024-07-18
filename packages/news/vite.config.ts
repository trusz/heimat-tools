import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [svelte()],
	preview: {
        port: 57453,
    },
	build: {
		lib: {
			entry:    "src/lib.ts",
			formats:  ["es"],
			fileName: "index",
		},
		// sourcemap: isDevelopment ? "inline" : false,
		sourcemap: "inline",
	},
})
