import { main } from "bruh/dom/html"
import { svg, defs, path } from "bruh/dom/svg"

import { numbers, holes } from "./numbers.mjs"
import dial from "./dial.mjs"
import display from "./display.jsx"

const app =
  main(
    // The display has the instructions,
    // a link to call the currently dialed number,
    // and a button to clear it
    display,

    // This svg has the actual "phone" part of the app
    svg({ viewBox: `0 0 100 100` },
      // svg makes us add our finger-holes mask into the defs,
      // it is later linked by id in the dial
      defs(
        holes
      ),

      // The numbers in a circle
      numbers,

      // A circle that has finger holes in it that is interactive
      dial,

      // The finger stopper
      path({
        d: `M85,55 a 10 8 5 0 0 15 -1`,
        fill: "none",
        stroke: "black",
        "stroke-width": "3px",
        "stroke-linecap": "round"
      })
    )
  )

// Add our app to the DOM
document.body.replaceChildren(
  app.toNode()
)
