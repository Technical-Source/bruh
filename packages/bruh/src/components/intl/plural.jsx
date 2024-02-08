import {
  bruhChildrenToNodes,
  h, // @jsx h
  JSXFragment, // @jsxFrag JSXFragment
} from "../../dom/index.browser.mjs"
import { r } from "../../reactive/index.mjs"
import { attempt, camelToDashCase, mapObject } from "../../util/index.mjs"
import { BruhCustomElementBase, spaceSeparated } from "../util.mjs"
import { browserLanguages, parseLocales } from "./util.mjs"

const optionNames = [
  "localeMatcher",
  "type",
  // digit options
  "minimumIntegerDigits",
  "minimumFractionDigits",
  "maximumFractionDigits",
  "minimumSignificantDigits",
  "maximumSignificantDigits",
  "roundingPriority",
  "roundingIncrement",
  "roundingMode",
  "trailingZeroDisplay"
]
const optionToAttribute = Object.fromEntries(
  optionNames.map(option => [option, camelToDashCase(option)])
)

export class BruhPlural extends BruhCustomElementBase {
  static observedAttributes = [
    "number",
    "end-number",
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
  #pluralRules
  #selected

  constructor() {
    super()

    this.#locales = r([this.bruh.attributes.locales, browserLanguages], () =>
      parseLocales([
        ...this.bruh.attributes.locales.value ?? [],
        ...browserLanguages.value
      ])
    )

    const optionToReactiveAttribute = mapObject(optionToAttribute,
      ([option, attribute]) => [option, this.bruh.attributes[attribute]]
    )
    this.#options = r(Object.values(optionToReactiveAttribute), () =>
      mapObject(optionToReactiveAttribute, ([option, attribute]) => [option, attribute.value || undefined])
    )

    this.#pluralRules = r([this.#locales, this.#options], () =>
      attempt(() => new Intl.PluralRules(this.#locales.value, this.#options.value))
        ?? new Intl.PluralRules(this.#locales.value)
    )

    const numberToSelect = this.bruh.attributes.number
    const rangeEndNumberToSelect = this.bruh.attributes["end-number"]

    this.#selected = r([this.#pluralRules, numberToSelect, rangeEndNumberToSelect], () => {
      if (!numberToSelect.value)
        return

      const pluralRules = this.#pluralRules.value
      const { locale } = pluralRules.resolvedOptions()
      if (!this.#locales.value.some(preferred => locale === preferred + ""))
        console.warn(`Resolved locale (${locale}) does not match`)

      const category =
        rangeEndNumberToSelect.value
          ? pluralRules.selectRange(numberToSelect.value, rangeEndNumberToSelect.value)
          : pluralRules.select(numberToSelect.value)

      const categories = ["zero", "one", "two", "few", "many", "other"]
      // Render nested slots for fallback (no correct fallback order)
      return [...new Set([category, ...categories])]
        .reduceRight((fallback, category) =>
          <slot name={category}>{fallback}</slot>
        , undefined)
    })

    const shadowContent = bruhChildrenToNodes([this.#selected])
    this
      .attachShadow({ mode: "open" })
      .append(...shadowContent)
  }
}

customElements.define("bruh-plural", BruhPlural)
