import { MetaElement, t } from "bruh/dom"
import { r } from "bruh/reactive"

const counter = document.querySelector(".counter")
const placeholder = MetaElement.from(counter.querySelector("bruh-textnode"))

const count = r(0)
placeholder.replaceWith(t(count))

counter.addEventListener("click", () => count.value++)
