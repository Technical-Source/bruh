import { e } from "bruh/dom"
import { functionAsObject } from "bruh/util"
const { main } = functionAsObject(e)

import { counter } from "./counter.jsx"

const app =
  main(
    <h1>Bruh</h1>,
    counter
  )

document.body.replaceChildren(app.node)
