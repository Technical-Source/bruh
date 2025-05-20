/** @jsxImportSource bruh/browser */
import { bruhChildrenToNodes, type BruhChild } from "bruh/browser"
import { r } from "../../reactive/index.mts"
import { attempt, mapObject } from "../../utils/index.mts"
import { spaceSeparated } from "../utils.mts"
import { BruhCustomElementBase } from "../custom-elements.mts"
import { inferDirection, parseLocales, userLanguages } from "./utils.mts"

const optionToAttribute = {
  // locale options
  localeMatcher: "locale-matcher",
  numberingSystem: "numbering-system",
  // style options
  style: "format-style",
  currency: "currency",
  currencyDisplay: "currency-display",
  currencySign: "currency-sign",
  unit: "unit",
  unitDisplay: "unit-display",
  // digit options
  minimumIntegerDigits: "minimum-integer-digits",
  minimumFractionDigits: "minimum-fraction-digits",
  maximumFractionDigits: "maximum-fraction-digits",
  minimumSignificantDigits: "minimum-significant-digits",
  maximumSignificantDigits: "maximum-significant-digits",
  roundingPriority: "rounding-priority",
  roundingIncrement: "rounding-increment",
  roundingMode: "rounding-mode",
  trailingZeroDisplay: "trailing-zero-display",
  // other options
  notation: "notation",
  compactDisplay: "compact-display",
  useGrouping: "use-grouping",
  signDisplay: "sign-display"
} as const

type BruhNumberAttributes = {
  "number"?: Intl.StringNumericLiteral | string,
  "end-number"?: Intl.StringNumericLiteral | string,
  "locales"?: ReadonlyArray<Intl.UnicodeBCP47LocaleIdentifier>,
  "locale-matcher"?: Intl.NumberFormatOptions["localeMatcher"],
  "numbering-system"?: Intl.NumberFormatOptions["numberingSystem"],
  "format-style"?: Intl.NumberFormatOptions["style"],
  "currency"?: Intl.NumberFormatOptions["currency"],
  "currency-display"?: Intl.NumberFormatOptions["currencyDisplay"],
  "currency-sign"?: Intl.NumberFormatOptions["currencySign"],
  "unit"?: Intl.NumberFormatOptions["unit"],
  "unit-display"?: Intl.NumberFormatOptions["unitDisplay"],
  "minimum-integer-digits"?: Intl.NumberFormatOptions["minimumIntegerDigits"],
  "minimum-fraction-digits"?: Intl.NumberFormatOptions["minimumFractionDigits"],
  "maximum-fraction-digits"?: Intl.NumberFormatOptions["maximumFractionDigits"],
  "minimum-significant-digits"?: Intl.NumberFormatOptions["minimumSignificantDigits"],
  "maximum-significant-digits"?: Intl.NumberFormatOptions["maximumSignificantDigits"],
  "rounding-priority"?: Intl.NumberFormatOptions["roundingPriority"],
  "rounding-increment"?: Intl.NumberFormatOptions["roundingIncrement"],
  "rounding-mode"?: Intl.NumberFormatOptions["roundingMode"],
  "trailing-zero-display"?: Intl.NumberFormatOptions["trailingZeroDisplay"],
  "notation"?: Intl.NumberFormatOptions["notation"],
  "compact-display"?: Intl.NumberFormatOptions["compactDisplay"],
  "use-grouping"?: Intl.NumberFormatOptions["useGrouping"],
  "sign-display"?: Intl.NumberFormatOptions["signDisplay"]
}

const isParseable = (s: string | number | bigint): s is Intl.StringNumericLiteral | number | bigint =>
  new Intl.NumberFormat()
    .formatToParts(s as any as number)
    .every(part => part.type !== "nan")

export class BruhNumber extends BruhCustomElementBase<BruhNumberAttributes> {
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
  #formatter
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
      mapObject(optionToReactiveAttribute, ([option, attribute]) => [option, attribute.value || undefined]) as Partial<Intl.NumberFormatOptions>
    )

    this.#formatter = r([this.#locales, this.#options], () =>
      attempt(() => new Intl.NumberFormat(this.#locales.value, this.#options.value))
        ?? new Intl.NumberFormat(this.#locales.value)
    )

    const numberToFormat = this.bruh.attributes.number
    const rangeEndNumberToFormat = this.bruh.attributes["end-number"]

    const renderParts = (parts: ReadonlyArray<Intl.NumberFormatPart>, fallback?: BruhChild) =>
      parts.map(part => {
        const value =
          part.type !== "nan" || !fallback
            ? part.value
            : <bdi>{fallback}</bdi> as HTMLElement

        return <span class={`bruh-number-part bruh-number-part--${part.type}`}>{value}</span> as HTMLSpanElement
      })

    const renderSingle = (number: string | number | bigint) =>
      renderParts(this.#formatter.value.formatToParts(number as number), number)

    const renderRange = (
      start: string | number | bigint,
      end: string | number | bigint
    ) => {
      const formatter = this.#formatter.value

      const canRenderRangeDirectly =
        "formatRangeToParts" in formatter
        && isParseable(start)
        && isParseable(end)
      if (!canRenderRangeDirectly)
        return <>{renderSingle(start)}–{renderSingle(end)}</> as BruhChild

      const parts = formatter.formatRangeToParts(start, end)
      const bySource = parts.reduce<Intl.NumberRangeFormatPart[][]>((bySource, part, i) => {
        if (!i || parts[i - 1].source !== part.source)
          bySource.push([])
        bySource[bySource.length - 1].push(part)
        return bySource
      }, [])
      return bySource.map(parts =>
        <span class={`bruh-number-source bruh-number-source--${parts[0].source}`}>{renderParts(parts)}</span>
      )
    }

    this.#formatted = r([this.#formatter, numberToFormat, rangeEndNumberToFormat], () => {
      if (!numberToFormat.value)
        return

      const formatter = this.#formatter.value
      const { locale } = formatter.resolvedOptions()
      const direction = inferDirection(locale)

      const result =
        rangeEndNumberToFormat.value
          ? renderRange(numberToFormat.value, rangeEndNumberToFormat.value)
          : renderSingle(numberToFormat.value)

      return <bdi lang={locale} dir={direction}>{result}</bdi>
    })
  }

  mountedCallback() {
    const children = bruhChildrenToNodes([this.#formatted])
    this.replaceChildren(...children)
  }
}

customElements.define("bruh-number", BruhNumber)

declare global {
  interface HTMLElementTagNameMap {
    "bruh-number": BruhNumber
  }
}
declare module "html-info" {
  interface HTMLTagToAttributes {
    "bruh-number": {
      "number": Intl.StringNumericLiteral | string,
      "end-number"?: Intl.StringNumericLiteral | string,
      /**
       * Space separated list of locales
       */
      "locales"?: string,
      "locale-matcher"?: Intl.NumberFormatOptions["localeMatcher"],
      "numbering-system"?: Intl.NumberFormatOptions["numberingSystem"],
      "format-style"?: Intl.NumberFormatOptions["style"],
      "currency"?: Intl.NumberFormatOptions["currency"],
      "currency-display"?: Intl.NumberFormatOptions["currencyDisplay"],
      "currency-sign"?: Intl.NumberFormatOptions["currencySign"],
      "unit"?: Intl.NumberFormatOptions["unit"],
      "unit-display"?: Intl.NumberFormatOptions["unitDisplay"],
      "minimum-integer-digits"?: Intl.NumberFormatOptions["minimumIntegerDigits"] | `${number}`,
      "minimum-fraction-digits"?: Intl.NumberFormatOptions["minimumFractionDigits"] | `${number}`,
      "maximum-fraction-digits"?: Intl.NumberFormatOptions["maximumFractionDigits"] | `${number}`,
      "minimum-significant-digits"?: Intl.NumberFormatOptions["minimumSignificantDigits"] | `${number}`,
      "maximum-significant-digits"?: Intl.NumberFormatOptions["maximumSignificantDigits"] | `${number}`,
      "rounding-priority"?: Intl.NumberFormatOptions["roundingPriority"],
      "rounding-increment"?: Intl.NumberFormatOptions["roundingIncrement"] | `${Intl.NumberFormatOptions["roundingIncrement"]}`,
      "rounding-mode"?: Intl.NumberFormatOptions["roundingMode"],
      "trailing-zero-display"?: Intl.NumberFormatOptions["trailingZeroDisplay"],
      "notation"?: Intl.NumberFormatOptions["notation"],
      "compact-display"?: Intl.NumberFormatOptions["compactDisplay"],
      "use-grouping"?: Intl.NumberFormatOptions["useGrouping"],
      "sign-display"?: Intl.NumberFormatOptions["signDisplay"]
    }
  }
}
