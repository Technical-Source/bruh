import fs from "node:fs/promises"
import type { Dirent } from "node:fs"
import path from "node:path"
import { createServer, type Plugin, type ResolvedConfig, type ViteDevServer } from "vite"
import mdx, { type Options as MDXOptions } from "@mdx-js/rollup"

const excludeEntry = (entry: Dirent, directory?: string) =>
  entry.isDirectory() && entry.name == "node_modules"

const getHtmlRenderFiles = async (
  directory: string,
  htmlRenderFileExtention: RegExp,
  maxDepth = Infinity
): Promise<string[]> => {
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

type HtmlRenderFileComponentsExport = {
  [componentName: string]: unknown
}
type HtmlRenderFileDefaultExport = (
  props?: {
    components?: HtmlRenderFileComponentsExport,
  }
) => unknown

type HtmlRenderFileModule = {
  default?: HtmlRenderFileDefaultExport,
  components?: HtmlRenderFileComponentsExport
}

const renderHtml = async (viteDevServer: ViteDevServer, htmlRenderFile: string | undefined) => {
  if (!htmlRenderFile)
    return

  const module: HtmlRenderFileModule = await viteDevServer.ssrLoadModule(htmlRenderFile)
  const { default: render, components } = module
  const rendered = await render?.({ components })
  if (rendered)
    return rendered + ""
}

export const bruhDev = ({
  htmlRenderFileExtention,
  root
}: {
  htmlRenderFileExtention: RegExp
  root?: string
}): Plugin => {
  let config: ResolvedConfig

  const urlToHtmlRenderFile = async (url = "") => {
    const resolvedRoot = root || path.resolve(config.root || "")
    const pathname = path.join(resolvedRoot, path.normalize(url))
    const htmlRenderFiles = await getHtmlRenderFiles(path.dirname(pathname), htmlRenderFileExtention, 2)
    for (const htmlRenderFile of htmlRenderFiles) {
      const htmlRenderFileName = htmlRenderFile.replace(htmlRenderFileExtention, "")
      if (
        htmlRenderFileName === pathname ||
        htmlRenderFileName === path.join(pathname, "index")
      )
        return htmlRenderFile
    }
  }

  return {
    name: "bruh:dev",
    apply: "serve",
    enforce: "pre",

    configResolved(resolvedConfig) {
      config = resolvedConfig
    },

    configureServer(viteDevServer) {
      viteDevServer.middlewares.use(async (req, res, next) => {
        try {
          const htmlRenderFile = await urlToHtmlRenderFile(req.url)
          const rendered = await renderHtml(viteDevServer, htmlRenderFile)
          if (rendered) {
            const transformedHTML = await viteDevServer.transformIndexHtml(req.url ?? "", rendered + "")

            res.setHeader("Content-Type", "text/html")
            return res.end(transformedHTML)
          }
          next()
        }
        catch (e) {
          const error = e as Error

          viteDevServer.ssrFixStacktrace(error)
          console.error(error)

          res.statusCode = 500
          return res.end(error.stack)
        }
      })
    }
  }
}

export const bruhBuild = ({
  htmlRenderFileExtention,
  root
}: {
  htmlRenderFileExtention: RegExp
  root?: string
}): Plugin => {
  let viteDevServer: ViteDevServer

  const idToHtmlRenderFile = new Map<string, string>()

  return {
    name: "bruh:build",
    apply: "build",
    enforce: "pre",

    async buildStart() {
      viteDevServer = await createServer()
    },

    async resolveId(source) {
      if (!htmlRenderFileExtention.test(source))
        return

      const id = source.replace(htmlRenderFileExtention, ".html")
      idToHtmlRenderFile.set(id, source)
      return id
    },

    async load(id) {
      const htmlRenderFile = idToHtmlRenderFile.get(id)
      if (!htmlRenderFile)
        return

      const rendered = await renderHtml(viteDevServer, htmlRenderFile)
      return {
        code: rendered ?? "",
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

export const bruhJSX = (): Plugin => {
  return {
    name: "bruh:jsx",

    config() {
      return {
        esbuild: {
          jsx: "automatic"
        }
      }
    }
  }
}

export const bruh = ({
  htmlRenderFileExtention = /\.html\.(m?[jt]sx?|mdx?)?$/,
  root,
  mdxOptions = {}
}: {
  htmlRenderFileExtention?: RegExp
  root?: string
  mdxOptions?: MDXOptions
} = {}) =>
  [
    mdx({
      ...mdxOptions,
      jsxRuntime: "automatic",
      jsxImportSource: "bruh/server",
      elementAttributeNameCase: "html"
    }) as Plugin,
    bruhDev({
      htmlRenderFileExtention,
      root
    }),
    bruhBuild({
      htmlRenderFileExtention,
      root
    }),
    bruhJSX()
  ]

export default bruh
