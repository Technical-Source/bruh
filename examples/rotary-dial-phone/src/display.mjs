import { h1, a, button } from "bruh/dom/html"

const telLink = a({ href: "tel:" }).toNode()
export const dialNumber = number => {
  telLink.textContent += number
  telLink.href += number
}

const clearButton = button("Clear Number").toNode()
clearButton.addEventListener("click", () => {
  telLink.textContent = ""
  telLink.href = "tel:"
})

export const display =
  h1(
    "Go ahead and dial a phone number: ",
    telLink,
    clearButton
  )