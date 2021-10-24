import { e } from "bruh/dom"

import { functionAsObject } from "bruh/util"
const { main, h1 } = functionAsObject(e)

import { counter } from "./counter.mjs"

document.body.replaceChildren(
  main(
    h1("Bruh"),
    counter
  )
)
