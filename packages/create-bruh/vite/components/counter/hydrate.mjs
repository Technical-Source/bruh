import { hydrateTextNodes } from "bruh/dom"

const { counterNumber } = hydrateTextNodes()
const counter = document.querySelector(".counter")

let n = 0
counterNumber.bruh = {
  get n() {
    return n
  },

  set n(number) {
    counterNumber.textContent = n = number
  }
}

counter.addEventListener("click", () => counterNumber.bruh.n++)
