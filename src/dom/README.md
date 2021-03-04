`app.mjs`
```javascript
import { t, section, h1 } from "bruh/dom"
import { svg, circle } from "bruh/dom/svg"

let seconds = 0
// This is a meta text node that we can put arbitrary
// things into and use them later in the browser
export const secondsText = t(seconds)
  .bruh(node => ({
    // This text node's state
    get seconds() {
      return seconds
    },
    set seconds(n) {
      node.textContent = seconds = n
      return seconds
    },

    interval: null,

    // State transition functions
    increment: () => ++node.bruh.seconds,
    decrement: () => --node.bruh.seconds,

    startClock() {
      node.bruh.interval = setInterval(node.bruh.increment, 1000)
    },
    stopClock() {
      clearInterval(node.bruh.interval)
    }
  }))

// This is our app's meta node
// It can be prerendered for initial serve
// and rebound in the browser
export const app =
  section().attributes({ class: "bruh moment" }).append(
    h1(secondsText, " seconds so far...")
      .data({ awesome: true }),
    "other text",
    svg().attributes({ viewBox: "0 0 10 10" }).append(
      circle().attributes({ cx: 5, cy: 5, r: 2 })
    )
  )
```

`prerender.mjs`
```javascript
import { html, head, title, body } from "bruh/dom"
import { app } from "./app.mjs"

export default
  html(
    head(
      title("My epic app")
    ),
    body(
      // Add a `data-bruh` attribute to mark it
      // for later rebinding in the browser
      app.data({ bruh: "" })
    )
  ).toString()
```

`browser.mjs`
```javascript
import { rebind } from "bruh/dom"
import { app, secondsText } from "./app.mjs"

// Rebind all node builder objects to the prerendered document
rebind(app)
// We can now access the actual DOM node that got rebound to
// the imported meta text node and do arbitrary things with it
secondsText.node.bruh.startClock()
```
