import { writeFile } from "fs/promises"

import { html, head, title, body, script } from "bruh/dom/html"
import app from "./app/prerender.mjs"

const document =
  "<!doctype html>" +
  html(
    head(
      title("My epic app"),
      script({ type: "module", src: "./index.mjs" })
    ),
    body(
      app
    )
  ).toString()

await writeFile(new URL("../dist/index.html", import.meta.url), document)
