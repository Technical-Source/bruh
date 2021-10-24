import { e, t } from "bruh/dom"
import { r } from "bruh/reactive"

import { functionAsObject } from "bruh/util"
const { button } = functionAsObject(e)

const n = r(0)

export const counter =
  button({ class: "counter", "data-lol": n },
    "Click to increment: ", t(n)
  )

counter.addEventListener("click", () => n.value++)
