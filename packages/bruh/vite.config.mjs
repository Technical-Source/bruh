import { defineConfig } from "vite"
import nodeExternals from "rollup-plugin-node-externals"
import dts from "vite-plugin-dts"
import tsconfigPaths from "vite-tsconfig-paths"
import { playwright } from "@vitest/browser-playwright"
import exportToSource from "./exportToSource.mjs"

export default defineConfig({
  build: {
    lib: {
      formats: ["es"],
      entry: exportToSource,
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
    ],
    projects: [
      {
        extends: true,
        test: {
          name: "node",
          exclude: [
            "./src/**/*.browser.test.*"
          ],
          benchmark: {
            exclude: [
              "./src/**/*.browser.bench.*"
            ]
          },
        }
      },
      {
        extends: true,
        test: {
          name: "browser",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [
              { browser: "chromium" },
              { browser: "webkit" },
              { browser: "firefox" }
            ]
          },
          exclude: [
            "./src/**/*.server.test.*"
          ],
          benchmark: {
            exclude: [
              "./src/**/*.server.bench.*"
            ]
          }
        }
      }
    ]
  }
})
