import { defineConfig } from "vite"
// import bruh from "vite-plugin-bruh"

export default defineConfig({
  // plugins: [
  //   bruh()
  // ]
  build: {
    manifest: true,
    rollupOptions: {
      input: new URL("./index.mjs", import.meta.url).pathname
    }
  }
})
