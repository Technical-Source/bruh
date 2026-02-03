const src = path => new URL(path, import.meta.url).pathname

export default {
  "browser": src("./src/dom/index.browser.mts"),
  "browser/jsx-runtime": src("./src/dom/browser/jsx-runtime.mts"),

  "server": src("./src/dom/index.server.mts"),
  "server/jsx-runtime": src("./src/dom/server/jsx-runtime.mts"),

  "reactive": src("./src/reactive/index.mts"),
  "reactive/sync/transport/websocket/browser": src("./src/reactive/sync/transport/websocket/browser.mts"),

  "utils": src("./src/utils/index.mts"),
  "utils/browser": src("./src/utils/browser.mts"),

  "cli/node": src("./src/cli/index.mts"),

  "media/images/node": src("./src/media/images.node.mts"),

  "components/optimized-picture/server": src("./src/components/optimized-picture/server.tsx"),
  "components/optimized-picture/hydrate": src("./src/components/optimized-picture/hydrate.mts"),

  "components/utils": src("./src/components/utils.mts"),
  "components/misc": src("./src/components/misc.mts"),
  "components/custom-elements": src("./src/components/custom-elements.mts"),

  "components/intl/utils": src("./src/components/intl/utils.mts"),
  "components/intl/display-name": src("./src/components/intl/display-name.tsx"),
  "components/intl/number": src("./src/components/intl/number.tsx"),
  "components/intl/plural": src("./src/components/intl/plural.tsx"),
  "components/intl/list": src("./src/components/intl/list.tsx"),
  "components/intl/language-picker": src("./src/components/intl/language-picker.tsx"),
  "components/intl/date-time": src("./src/components/intl/date-time.tsx"),

  "components/aside-toc": src("./src/components/aside-toc/index.tsx"),

  "polyfills/weakref": src("./src/polyfills/weakref.mts")
}
