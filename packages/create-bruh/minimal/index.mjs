import "./node_modules/bruh/dist/bruh.umd.js"
const { r } = bruh.reactive
const { main, h1, button } = bruh.util.functionAsObject(bruh.dom.e)

const Counter = () => {
  const count = r(0)
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
