import { button } from "bruh/dom/html"

const telLink = (<a href="tel:" />).toNode()

document.addEventListener("dialed-number", dialEvent => {
  const number = dialEvent.detail
  telLink.textContent += number
  telLink.href += number
})

const clearButton = button("Clear Number").toNode()
clearButton.addEventListener("click", () => {
  telLink.textContent = ""
  telLink.href = "tel:"
})

export default
  <div>
    <h1>Go ahead and dial a phone number: </h1>
    { telLink }
    { clearButton }
  </div>
