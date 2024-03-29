import { defineConfig } from "vite"

export default defineConfig({
  build: {
    lib: {
      name: "bruh",
      entry: new URL("./src/index.browser.mjs", import.meta.url).pathname,
      fileName: format => `bruh.${format}.js`
    },
    sourcemap: true
  }
})
