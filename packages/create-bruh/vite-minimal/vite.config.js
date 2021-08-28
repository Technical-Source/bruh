import { defineConfig } from "vite"

export default defineConfig({
  esbuild: {
    jsxFactory: "h",
    jsxFragment: "JSXFragment",
    jsxInject: `import { h, JSXFragment } from "bruh/dom"`
  }
})
