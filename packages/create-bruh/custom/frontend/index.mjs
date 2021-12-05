import { e } from "bruh/dom"
import { functionAsObject } from "bruh/util"
const { main, h1, button } = functionAsObject(e)

import remoteReactives from "bruh/hydrate/reactive"

const Counter = () => {
  const { count } = remoteReactives
  count.value ??= 0
  const increment = () => count.value++

  const counter =
    button({ class: "counter", onclick: increment },
      "Click to increment: ", count
    )

  return counter
}

document.body.append(
  main(
    h1("Bruh"),
    Counter()
  )
)
