# `vite-plugin-bruh` - A vite plugin to integrate with bruh

## Install

`npm i -D vite-plugin-bruh` or use `npm init bruh` with the `vite` template to quickly get started.

## Use

Example `vite.config.mjs` file:
```javascript
import { defineConfig } from "vite"
import bruh from "vite-plugin-bruh"

export default defineConfig({
  plugins: [
    bruh({
      // Regex for the page render file extention
      // Defaults to /\.html\.(mjs|jsx?|tsx?)$/
      htmlRenderFileExtention,
      // Absolute path of the root pages directory
      // Defaults to vite's root
      root,
      // A (hopefully) temporary workaround of allowed node module imports
      // Adds to the default array of ["fs", "path", "crypto"]
      external
    })
  ]
})
```

This allows you to use the typical `vite` for development and `vite build` for production.
`vite-plugin-bruh` will automatically allow you to prerender html files before vite sees them.

Here is an example project structure:
```
.
├── index.css
├── index.html.jsx
├── index.mjs
├── package-lock.json
├── package.json
└── vite.config.mjs
```

## How it works

Upon a page request for `/x` in dev:
1. The `x.html.mjs` (or `x/index.html.mjs`, `...js/jsx/ts/tsx`) file is imported
2. The default export is called and `await`ed
3. The returned string is exposed to vite as if it were from `x.html` (or `x/index.html`)

At build time, all `x.html.mjs` files are automatically included as entry points (as if they were `x.html`)

If this is `index.html.mjs`:
```javascript
export default async () =>
`<!doctype html>
<html>
  <head>
    ...
  </head>

  <body>
    ...
  </body>
</html>
`
```

Vite sees this as if `index.html` existed and contained:
```html
<!doctype html>
<html>
  <head>
    ...
  </head>

  <body>
    ...
  </body>
</html>
```

During dev, vite will automatically and quickly reload the page as `index.html.mjs` and its imports are edited.

## JSX/TSX

This plugin automatically includes jsx support for bruh, meaning that you can freely write jsx content in both
render files (`x.html.jsx`) and hydrate files (`x.jsx`, what vite typically handles).

## Current Caveats

Vite currently needs an explicit array of node core modules that it should allow to passthrough its module graph.
You need to specify them in the `external` option, the defaults are just `["fs", "path", "crypto"]` right now.

If you want to use `import.meta.url`, vite will currently give a (non URL!) absolute path that is "relative" to your vite `root`.
The easiest workaround is to just do something like this:
```javascript
import path from "path"

// A path relative to where the `vite` command is run
path.resolve("a/path/relative/to/the/vite/currentWorkingDirectory")

// Instead of what you would expect to work
new URL("a/path/relative/to/this/file", import.meta.url).pathname
```
