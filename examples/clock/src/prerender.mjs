import { writeFile } from "fs/promises"

import { html, head, title, body, script } from "bruh/dom/html"
import { app } from "./app.mjs"

const document =
  "<!doctype html>" +
  html(
    head(
      title("My epic app"),
      script({ type: "module", defer: "", src: "./index.mjs" })
    ),
    body(
      // Add a `data-bruh` attribute to mark it
      // for later rebinding in the browser
      app.data({ bruh: "" })
    )
  ).toString()

await writeFile(new URL("../dist/index.html", import.meta.url), document)
