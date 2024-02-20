import {
  bruhChildrenToNodes,
  h, // @jsx h
  JSXFragment, // @jsxFrag JSXFragment
} from "../../dom/index.browser.mjs"
import { r } from "../../reactive/index.mjs"
import { attempt, camelToDashCase, mapObject } from "../../util/index.mjs"
import { BruhCustomElementBase, spaceSeparated } from "../util.mjs"
import { inferDirection, parseLocales, userLanguages } from "./util.mjs"

const optionNames = [
  "localeMatcher",
  "type",
  "style"
]
const optionToAttribute = Object.fromEntries(
  optionNames.map(option => {
    if (option === "style")
      return [option, "format-style"]

    return [option, camelToDashCase(option)]
  })
)

export class BruhList extends BruhCustomElementBase {
  static observedAttributes = [
    "locales",
    ...Object.values(optionToAttribute)
  ]

  static bruh = {
    parseAttributes: {
      locales: spaceSeparated
    }
  }

  #locales
  #options
  #formatter
  #itemSlotNames = r()
  #formatted

  constructor() {
    super()

    this.#locales = r([this.bruh.attributes.locales, userLanguages], () =>
      parseLocales([
        ...this.bruh.attributes.locales.value ?? [],
        ...userLanguages.value
      ])
    )

    const optionToReactiveAttribute = mapObject(optionToAttribute,
      ([option, attribute]) => [option, this.bruh.attributes[attribute]]
    )
    this.#options = r(Object.values(optionToReactiveAttribute), () =>
      mapObject(optionToReactiveAttribute, ([option, attribute]) => [option, attribute.value || undefined])
    )

    this.#formatter = r([this.#locales, this.#options], () =>
      attempt(() => new Intl.ListFormat(this.#locales.value, this.#options.value))
        ?? new Intl.ListFormat(this.#locales.value)
    )

    const renderParts = parts =>
      parts.map(part => {
        const partAttribute = `part ${part.type}`
        return part.type === "element"
          ? <bdi  part={partAttribute} role="listitem"><slot name={part.value} /></bdi>
          : <span part={partAttribute}>{part.value}</span>
      })

    this.#formatted = r([this.#formatter, this.#itemSlotNames], () => {
      if (!this.#itemSlotNames.value)
        return

      const formatter = this.#formatter.value
      const { locale } = formatter.resolvedOptions()
      const direction = inferDirection(locale)

      const result = renderParts(formatter.formatToParts(this.#itemSlotNames.value))

      return <bdi lang={locale} dir={direction} aria-role="list">{result}</bdi>
    })

    const shadowContent = bruhChildrenToNodes([this.#formatted])
    this
      .attachShadow({ mode: "open" })
      .append(...shadowContent)
  }

  mountedCallback() {
    const assignSlots = () => {
      this.#itemSlotNames.value = [...this.children].map((child, i) => {
        const slot = "" + (i + 1)
        child.slot = slot
        return slot
      })
    }
    assignSlots()
    new MutationObserver(assignSlots).observe(this, { childList: true })
  }
}

customElements.define("bruh-list", BruhList)
