import { t } from "bruh/dom"
import { r } from "bruh/reactive"

const n = r(0)

export const { node: counter } =
  <button class="counter" data-lol={ n }>
    Click to increment: { t(n) }
  </button>

counter.addEventListener("click", () => n.value++)
