import { defineConfig } from "vite"
import nodeExternals from "rollup-plugin-node-externals"
import dts from "vite-plugin-dts"
import tsconfigPaths from "vite-tsconfig-paths"

const src = path => new URL(path, import.meta.url).pathname

export default defineConfig({
  build: {
    lib: {
      formats: ["es"],
      entry: {
        "index": src("./src/index.mts")
      },
      fileName: (format, name) => `${name}.mjs`
    },
    sourcemap: true,
    minify: false,
    reportCompressedSize: false,
    target: "esnext"
  },
  plugins: [
    nodeExternals(),
    tsconfigPaths(),
    dts({
      outDir: "./dist/types/",
      exclude: [
        "./src/**/*.test.*",
        "./src/**/*.bench.*"
      ]
    })
  ],
  test: {
    include: [
      "./src/**/*.test.{mts,tsx}"
    ]
  }
})
