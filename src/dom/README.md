```javascript
import { t, section, h1 } from "bruh/dom"
// or, in the browser
// import { t, section, h1 } from "https://unpkg.com/bruh/src/dom/index.mjs"

let seconds = 0
const secondsText = t(seconds)

document.body.replaceChildren(
  section().attributes({ class: "bruh moment" }).append(
    h1(secondsText, " seconds so far...")
      .data({ awesome: true }),
    "other text"
  ).element
)

setInterval(() => {
  secondsText.textContent = ++seconds
}, 1000)
```