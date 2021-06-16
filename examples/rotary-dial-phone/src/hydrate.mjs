import {
  main, h1, a, button
} from "bruh/dom/html"
import { svg, defs, path } from "bruh/dom/svg"

import { display } from "./display.mjs"
import { numbers, holes } from "./numbers.mjs"
import dial from "./dial.mjs"


const app =
  main(
    display,

    svg({ viewBox: `0 0 100 100` },
      defs(
        holes
      ),

      numbers,

      dial,

      path({
        d: `M85,55 a 10 8 5 0 0 15 -1`,
        fill: "none",
        stroke: "black",
        "stroke-width": "3px",
        "stroke-linecap": "round"
      })
    )
  )

document.body.replaceChildren(
  app.toNode()
)
