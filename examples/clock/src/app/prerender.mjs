import { t, section, h1, hr } from "bruh/dom/html"
import { svg, circle } from "bruh/dom/svg"

export const seconds = t(0)
  .setOnHydrate(node => {
    let seconds = 0
    node.bruh = {
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
    }
  })
  .setHydrateTag("seconds")


export default () =>
  section({ class: "bruh moment" },
    h1(seconds, " seconds so far...")
      .addDataAttributes({ awesome: true }),
    "other text",
    hr(),
    svg({ viewBox: "0 0 10 10" },
      circle({ cx: 5, cy: 5, r: 2 })
    )
  )
