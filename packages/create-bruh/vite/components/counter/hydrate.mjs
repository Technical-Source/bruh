import { hydrateTextNodes, t } from "bruh/dom"
import { r } from "bruh/reactive"

const { counterNumber } = hydrateTextNodes()
const count = r(0)
counterNumber.replaceWith(t(count))

document.querySelector(".counter")
  .addEventListener("click", () => count.value++)
