import { hydrateTextNodes } from "bruh/dom/meta-node"

const { seconds: textNode } = hydrateTextNodes()

let seconds = 0
textNode.bruh = {
  // This text node's state
  get seconds() {
    return seconds
  },
  set seconds(n) {
    textNode.textContent = seconds = n
    return seconds
  },

  interval: null,

  // State transition functions
  increment: () => ++textNode.bruh.seconds,
  decrement: () => --textNode.bruh.seconds,

  startClock() {
    textNode.bruh.interval = setInterval(textNode.bruh.increment, 1000)
  },
  stopClock() {
    clearInterval(textNode.bruh.interval)
  }
}

textNode.bruh.startClock()
