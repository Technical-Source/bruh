```javascript
import { t, section, h1 } from "bruh/dom"
// or, to paste in your browser js console:
// const { t, section, h1 } = await import("https://unpkg.com/bruh/src/dom/index.mjs")

let seconds = 0
const secondsTextNode = t(seconds)

document.body.replaceChildren(
  section().attributes({ class: "bruh moment" }).append(
    h1(secondsTextNode, " seconds so far...")
      .data({ awesome: true }),
    "other text"
  ).node
)

setInterval(() => {
  secondsTextNode.text(++seconds)
}, 1000)
```