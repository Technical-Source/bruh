/** @jsxImportSource bruh/browser */
import { bruhChildrenToNodes } from "bruh/browser"
import { r } from "../../reactive/index.mts"
import { attempt, mapObject } from "../../utils/index.mts"
import { spaceSeparated } from "../utils.mts"
import { BruhCustomElementBase } from "../custom-elements.mts"
import { parseLocales, userLanguages } from "./utils.mts"

const optionToAttribute = {
  localeMatcher: "locale-matcher",
  type: "type",
  // digit options
  minimumIntegerDigits: "minimum-integer-digits",
  minimumFractionDigits: "minimum-fraction-digits",
  maximumFractionDigits: "maximum-fraction-digits",
  minimumSignificantDigits: "minimum-significant-digits",
  maximumSignificantDigits: "maximum-significant-digits",
  roundingPriority: "rounding-priority",
  roundingIncrement: "rounding-increment",
  roundingMode: "rounding-mode",
  trailingZeroDisplay: "trailing-zero-display"
} as const

type BruhPluralAttributes = {
  "number"?: Intl.StringNumericLiteral | string,
  "end-number"?: Intl.StringNumericLiteral | string,
  "locales"?: ReadonlyArray<Intl.UnicodeBCP47LocaleIdentifier>,
  "locale-matcher"?: Intl.PluralRulesOptions["localeMatcher"],
  "type"?: Intl.PluralRulesOptions["type"],
  "minimum-integer-digits"?: Intl.PluralRulesOptions["minimumIntegerDigits"],
  "minimum-fraction-digits"?: Intl.PluralRulesOptions["minimumFractionDigits"],
  "maximum-fraction-digits"?: Intl.PluralRulesOptions["maximumFractionDigits"],
  "minimum-significant-digits"?: Intl.PluralRulesOptions["minimumSignificantDigits"],
  "maximum-significant-digits"?: Intl.PluralRulesOptions["maximumSignificantDigits"],
  "rounding-priority"?: Intl.PluralRulesOptions["roundingPriority"],
  "rounding-increment"?: Intl.PluralRulesOptions["roundingIncrement"],
  "rounding-mode"?: Intl.PluralRulesOptions["roundingMode"],
  "trailing-zero-display"?: Intl.PluralRulesOptions["trailingZeroDisplay"]
}

const categories = ["zero", "one", "two", "few", "many", "other"] as const satisfies Intl.LDMLPluralRule[]

export class BruhPlural extends BruhCustomElementBase<BruhPluralAttributes> {
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
      mapObject(optionToReactiveAttribute, ([option, attribute]) => [option, attribute.value || undefined]) as Partial<Intl.PluralRulesOptions>
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
          ? pluralRules.selectRange(numberToSelect.value as any as number, rangeEndNumberToSelect.value as any as number)
          : pluralRules.select(numberToSelect.value as any as number)

      // Render nested slots for fallback (no correct fallback order)
      return [...new Set([category, ...categories])]
        .reduceRight<HTMLSlotElement>((fallback, category) =>
          <slot name={category}>{fallback}</slot>
        , undefined as any)
    })

    const shadowContent = bruhChildrenToNodes([this.#selected])
    this
      .attachShadow({ mode: "open" })
      .append(...shadowContent)
  }
}

customElements.define("bruh-plural", BruhPlural)

declare global {
  interface HTMLElementTagNameMap {
    "bruh-plural": BruhPlural
  }
}
declare module "html-info" {
  interface HTMLTagToAttributes {
    "bruh-plural": {
      "number": Intl.StringNumericLiteral | string,
      "end-number"?: Intl.StringNumericLiteral | string,
      /**
       * Space separated list of locales
       */
      "locales"?: string,
      "locale-matcher"?: Intl.PluralRulesOptions["localeMatcher"],
      "type"?: Intl.PluralRulesOptions["type"],
      "minimum-integer-digits"?: Intl.NumberFormatOptions["minimumIntegerDigits"] | `${number}`,
      "minimum-fraction-digits"?: Intl.NumberFormatOptions["minimumFractionDigits"] | `${number}`,
      "maximum-fraction-digits"?: Intl.NumberFormatOptions["maximumFractionDigits"] | `${number}`,
      "minimum-significant-digits"?: Intl.NumberFormatOptions["minimumSignificantDigits"] | `${number}`,
      "maximum-significant-digits"?: Intl.NumberFormatOptions["maximumSignificantDigits"] | `${number}`,
      "rounding-priority"?: Intl.PluralRulesOptions["roundingPriority"],
      "rounding-increment"?: Intl.PluralRulesOptions["roundingIncrement"] | `${Intl.PluralRulesOptions["roundingIncrement"]}`,
      "rounding-mode"?: Intl.PluralRulesOptions["roundingMode"],
      "trailing-zero-display"?: Intl.PluralRulesOptions["trailingZeroDisplay"]
    }
  }
}
