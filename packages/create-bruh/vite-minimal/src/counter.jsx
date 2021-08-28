import { t } from "bruh/dom"
import { r } from "bruh/reactive"

const n = r(0)

export const counter =
  (
    <button class="counter" data-lol={ n }>
      Click to increment: { t(n) }
    </button>
  ).node

counter.addEventListener("click", () => n.value++)
