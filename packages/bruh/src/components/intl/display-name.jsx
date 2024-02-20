import {
  bruhChildrenToNodes,
  h, // @jsx h
  JSXFragment, // @jsxFrag JSXFragment
} from "../../dom/index.browser.mjs"
import { r } from "../../reactive/index.mjs"
import { attempt, camelToDashCase, mapObject } from "../../util/index.mjs"
import { BruhCustomElementBase, spaceSeparated } from "../util.mjs"
import { inferDirection, languageDisplayName, parseLocales, userLanguages } from "./util.mjs"

const optionNames = [
  "localeMatcher",
  "style",
  "type",
  "languageDisplay"
]
const optionToAttribute = Object.fromEntries(
  optionNames.map(option => {
    if (option === "style")
      return [option, "format-style"]

    return [option, camelToDashCase(option)]
  })
)

export class BruhDisplayName extends BruhCustomElementBase {
  static observedAttributes = [
    "code",
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
      attempt(() =>
        new Intl.DisplayNames(this.#locales.value, this.#options.value)
      )
    )

    this.#formatted = r([this.#formatter, this.bruh.attributes.code], () => {
      const formatter = this.#formatter.value
      const code = this.bruh.attributes.code.value
      if (!formatter || !code)
        return

      const { locale, type } = formatter.resolvedOptions()
      const direction = inferDirection(locale)

      const value =
        type === "language"
          ? languageDisplayName(formatter, code)
          : attempt(() => formatter.of(code)) ?? code

      return <bdi lang={locale} dir={direction}>{value}</bdi>
    })
  }

  mountedCallback() {
    const children = bruhChildrenToNodes([this.#formatted])
    this.replaceChildren(...children)
  }
}

customElements.define("bruh-display-name", BruhDisplayName)
