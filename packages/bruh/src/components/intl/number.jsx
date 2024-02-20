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
  // locale options
  "localeMatcher",
  "numberingSystem",
  // style options
  "style",
  "currency",
  "currencyDisplay",
  "currencySign",
  "unit",
  "unitDisplay",
  // digit options
  "minimumIntegerDigits",
  "minimumFractionDigits",
  "maximumFractionDigits",
  "minimumSignificantDigits",
  "maximumSignificantDigits",
  "roundingPriority",
  "roundingIncrement",
  "roundingMode",
  "trailingZeroDisplay",
  // other options
  "notation",
  "compactDisplay",
  "useGrouping",
  "signDisplay"
]
const optionToAttribute = Object.fromEntries(
  optionNames.map(option => {
    if (option === "style")
      return [option, "format-style"]

    return [option, camelToDashCase(option)]
  })
)

const isParseable = s =>
  new Intl.NumberFormat().formatToParts(s).every(part => part.type !== "nan")

export class BruhNumber extends BruhCustomElementBase {
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
      mapObject(optionToReactiveAttribute, ([option, attribute]) => [option, attribute.value || undefined])
    )

    this.#formatter = r([this.#locales, this.#options], () =>
      attempt(() => new Intl.NumberFormat(this.#locales.value, this.#options.value))
        ?? new Intl.NumberFormat(this.#locales.value)
    )

    const numberToFormat = this.bruh.attributes.number
    const rangeEndNumberToFormat = this.bruh.attributes["end-number"]

    const renderParts = (parts, fallback) =>
      parts.map(part => {
        const value =
          part.type !== "nan" || !fallback
            ? part.value
            : <bdi>{fallback}</bdi>

        return <span class={`bruh-number-part bruh-number-part--${part.type}`}>{value}</span>
      })

    const renderSingle = number =>
      renderParts(this.#formatter.value.formatToParts(number), number)

    const renderRange = (start, end) => {
      const formatter = this.#formatter.value

      const canRenderRangeDirectly =
        "formatRangeToParts" in formatter
        && isParseable(start)
        && isParseable(end)
      if (!canRenderRangeDirectly)
        return <>{renderSingle(start)}–{renderSingle(end)}</>

      const parts = formatter.formatRangeToParts(start, end)
      const bySource = parts.reduce((bySource, part, i) => {
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
