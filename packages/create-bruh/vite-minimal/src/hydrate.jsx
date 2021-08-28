import { main } from "bruh/dom/html"
import { counter } from "./counter.jsx"

const app =
  main(
    <h1>Bruh</h1>,
    counter
  )

document.body.replaceChildren(app.node)
