import { defineConfig } from "vite"
import nodeExternals from 'rollup-plugin-node-externals'
import dts from "vite-plugin-dts"
import tsconfigPaths from "vite-tsconfig-paths"

const src = path => new URL(path, import.meta.url).pathname

export default defineConfig({
  build: {
    lib: {
      formats: ["es"],
      entry: {
        "browser": src("./src/dom/index.browser.mts"),
        "browser/jsx-runtime": src("./src/dom/browser/jsx-runtime.mts"),

        "server": src("./src/dom/index.server.mts"),
        "server/jsx-runtime": src("./src/dom/server/jsx-runtime.mts"),

        "reactive": src("./src/reactive/index.mts"),

        "utils": src("./src/utils/index.mts"),
        "utils/browser": src("./src/utils/browser.mts"),

        "cli/node": src("./src/cli/index.mts"),

        "media/images/node": src("./src/media/images.node.mts"),

        "components/optimized-picture/server": src("./src/components/optimized-picture/server.tsx"),
        "components/optimized-picture/hydrate": src("./src/components/optimized-picture/hydrate.mts"),

        "components/utils": src("./src/components/utils.mts"),
        "components/custom-elements": src("./src/components/custom-elements.mts"),

        "components/intl/utils": src("./src/components/intl/utils.mts"),
        "components/intl/display-name": src("./src/components/intl/display-name.tsx"),
        "components/intl/number": src("./src/components/intl/number.tsx"),
        "components/intl/plural": src("./src/components/intl/plural.tsx"),
        "components/intl/list": src("./src/components/intl/list.tsx"),
        "components/intl/language-picker": src("./src/components/intl/language-picker.tsx"),
        "components/intl/date-time": src("./src/components/intl/date-time.tsx"),

        "polyfills/weakref": src("./src/polyfills/weakref.mts")
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
    ],
    workspace: [
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
            provider: "playwright",
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
