import fs from "fs/promises"
import path from "path"
import vite from "vite"
import { compile } from "xdm"

const mdx = ({ xdmOptions } = {}) => {
  return {
    name: "bruh:mdx",
    enforce: "pre",

    async transform(source, id) {
      if (!id.endsWith(".mdx"))
        return

      const result = await compile(source, {
        jsxRuntime: "classic",
        pragma: "h",
        pragmaFrag: "JSXFragment",
        ...xdmOptions
      })

      const code = result.value
        .replace(
          `import h from "react"`,
          `import { h, JSXFragment } from "bruh/dom"`
        )
        .replace(
          /classname/igm,
          "class"
        )

      return {
        code,
        map: { mappings: "" }
      }
    }
  }
}

const excludeEntry = (entry, directory) =>
  entry.isDirectory() && entry.name == "node_modules"

const getHtmlRenderFiles = async (directory, htmlRenderFileExtention, maxDepth = Infinity) => {
  if (maxDepth < 1)
    return []

  try {
    const entries = await fs.readdir(directory, { withFileTypes: true })
    const unflattenedFiles = await Promise.all(
      entries
        .map(async entry => {
          if (excludeEntry(entry, directory))
            return []

          const entryPath = path.join(directory, entry.name)

          if (entry.isDirectory())
            return getHtmlRenderFiles(entryPath, htmlRenderFileExtention, maxDepth - 1)
          if (htmlRenderFileExtention.test(entry.name))
            return [entryPath]

          return []
        })
    )
    return unflattenedFiles.flat()
  }
  catch {
    return []
  }
}

export const bruhDev = ({ htmlRenderFileExtention, root, external } = {}) => {
  let config = {}

  const urlToHtmlRenderFile = async url => {
    const resolvedRoot = root || path.resolve(config.root || "")
    const pathname = path.join(resolvedRoot, path.normalize(url))
    const htmlRenderFiles = await getHtmlRenderFiles(path.dirname(pathname), htmlRenderFileExtention, 2)
    for (const htmlRenderFile of htmlRenderFiles) {
      const htmlRenderFileName = htmlRenderFile.replace(htmlRenderFileExtention, "")
      if (htmlRenderFileName == pathname)
        return htmlRenderFile
      if (htmlRenderFileName == path.join(pathname, "index"))
        return htmlRenderFile
    }
  }

  return {
    name: "bruh:dev",
    apply: "serve",
    enforce: "pre",

    config() {
      return {
        optimizeDeps: {
          exclude: ["bruh/dom"]
        },
        ssr: {
          external
        }
      }
    },

    configResolved(resolvedConfig) {
      config = resolvedConfig
    },

    configureServer(viteDevServer) {
      viteDevServer.middlewares.use(async (req, res, next) => {
        try {
          const htmlRenderFile = await urlToHtmlRenderFile(req.url)
          if (htmlRenderFile) {
            const { default: render } = await viteDevServer.ssrLoadModule(htmlRenderFile)
            const rendered = await render()
            const transformedHTML = await viteDevServer.transformIndexHtml(req.url, rendered.toString())

            res.setHeader("Content-Type", "text/html")
            return res.end(transformedHTML)
          }
          next()
        }
        catch (error) {
          viteDevServer.ssrFixStacktrace(error)
          console.error(error)

          res.statusCode = 500
          return res.end(error.stack)
        }
      })
    }
  }
}

export const bruhBuild = ({ htmlRenderFileExtention, root } = {}) => {
  let viteDevServer

  const idToHtmlRenderFile = {}

  return {
    name: "bruh:build",
    apply: "build",
    enforce: "pre",

    async buildStart() {
      viteDevServer = await vite.createServer()
    },

    async resolveId(source) {
      if (htmlRenderFileExtention.test(source)) {
        const id = source.replace(htmlRenderFileExtention, ".html")
        idToHtmlRenderFile[id] = source
        return id
      }
    },

    async load(id) {
      if (!idToHtmlRenderFile[id])
        return

      const { default: render } = await viteDevServer.ssrLoadModule(idToHtmlRenderFile[id])
      const rendered = await render()
      return {
        code: rendered,
        map: ""
      }
    },

    async closeBundle() {
      return viteDevServer.close()
    },

    // Add all page render files to the build inputs
    async config(config) {
      const resolvedRoot = root || path.resolve(config.root || "")
      const htmlRenderFiles = await getHtmlRenderFiles(resolvedRoot, htmlRenderFileExtention)

      const input = Object.fromEntries(
        htmlRenderFiles
          .map(pathname => {
            const name = path.relative(resolvedRoot, pathname).replace(htmlRenderFileExtention, "")
            return [name, pathname]
          })
      )

      return {
        build: {
          rollupOptions: {
            input
          }
        }
      }
    }
  }
}

export const bruhJSX = () => {
  return {
    name: "bruh:jsx",

    config() {
      return {
        esbuild: {
          jsxFactory: "h",
          jsxFragment: "JSXFragment",
          jsxInject: `import { h, JSXFragment } from "bruh/dom"`
        }
      }
    }
  }
}

export const bruh = ({
  htmlRenderFileExtention = /\.html\.(mjs|jsx?|tsx?)$/,
  root,
  external = [],
  xdmOptions = {}
} = {}) =>
  [
    mdx({
      xdmOptions
    }),
    bruhDev({
      htmlRenderFileExtention,
      root,
      external: ["fs", "path", "crypto", ...external]
    }),
    bruhBuild({
      htmlRenderFileExtention,
      root
    }),
    bruhJSX()
  ]

export default bruh
