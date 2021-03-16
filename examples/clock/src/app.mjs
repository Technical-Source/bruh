import { t, section, h1, hr } from "bruh/dom/html"
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
    hr(),
    svg().attributes({ viewBox: "0 0 10 10" }).append(
      circle().attributes({ cx: 5, cy: 5, r: 2 })
    )
  )
