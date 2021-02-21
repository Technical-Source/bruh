```javascript
import { t, section, h1 } from "bruh/dom"
import { svg, circle } from "bruh/dom/svg"
// or, to paste in your browser js console:
// const { t, section, h1 } = await import("https://unpkg.com/bruh/src/dom/index.mjs")
// const { svg, circle } = await import("https://unpkg.com/bruh/src/dom/svg.mjs")

let seconds = 0
const secondsTextNode = t(seconds)
setInterval(() => {
  secondsTextNode.text(++seconds)
}, 1000)

document.body.replaceChildren(
  section().attributes({ class: "bruh moment" }).append(
    h1(secondsTextNode, " seconds so far...")
      .data({ awesome: true }),
    "other text",
    svg().attributes({ viewBox: "0 0 10 10" }).append(
      circle().attributes({ cx: 5, cy: 5, r: 2 })
    )
  ).node
)
```
