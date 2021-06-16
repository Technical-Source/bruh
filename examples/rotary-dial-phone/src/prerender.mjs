import { writeFile } from "fs/promises"

import { html, head, title, meta, link, script, body } from "bruh/dom/html"

const document =
  "<!doctype html>" +
  html(
    head(
      title("A Rotary Dial Phone Using Bruh"),
      meta({ name: "viewport", content: "width=device-width, initial-scale=1" }),
      link({ rel: "stylesheet", type: "text/css", href: "./index.css" }),
      script({ type: "module", src: "./index.mjs" })
    ),
    body()
  ).toString()

await writeFile(new URL("../dist/index.html", import.meta.url), document)
