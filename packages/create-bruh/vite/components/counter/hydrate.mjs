import { BruhText, t } from "bruh/browser"
import { r } from "bruh/reactive"

const [counterNumber] = BruhText.hydrated.counterNumber
const count = r(0)
counterNumber.replaceWith(t(count))

document.querySelector(".counter")
  .addEventListener("click", () => count.value++)
