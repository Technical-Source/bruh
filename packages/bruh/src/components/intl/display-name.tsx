/** @jsxImportSource bruh/browser */
import { bruhChildrenToNodes } from "bruh/browser"
import { r } from "../../reactive/index.mts"
import { attempt, mapObject } from "../../utils/index.mts"
import { spaceSeparated } from "../utils.mts"
import { BruhCustomElementBase } from "../custom-elements.mts"
import { inferDirection, languageDisplayName, parseLocales, userLanguages } from "./utils.mts"

const optionToAttribute = {
  localeMatcher: "locale-matcher",
  style: "format-style",
  type: "type",
  languageDisplay: "language-display"
} as const

type BruhDisplayNameAttributes = {
  "code"?: string,
  "locales"?: ReadonlyArray<Intl.UnicodeBCP47LocaleIdentifier>,
  "locale-matcher"?: Intl.DisplayNamesOptions["localeMatcher"],
  "format-style"?: Intl.DisplayNamesOptions["style"],
  "type"?: Intl.DisplayNamesOptions["type"],
  "language-display"?: Intl.DisplayNamesOptions["languageDisplay"]
}

export class BruhDisplayName extends BruhCustomElementBase<BruhDisplayNameAttributes> {
  static observedAttributes = [
    "code",
    "locales",
    ...Object.values(optionToAttribute)
  ] as const

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
      mapObject(optionToReactiveAttribute, ([option, attribute]) => [option, attribute.value || undefined]) as Partial<Intl.DisplayNamesOptions>
    )

    this.#formatter = r([this.#locales, this.#options], () =>
      attempt(() =>
        new Intl.DisplayNames(this.#locales.value, this.#options.value as any)
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

      return <bdi lang={locale} dir={direction}>{value}</bdi> as HTMLElement
    })
  }

  mountedCallback() {
    const children = bruhChildrenToNodes([this.#formatted])
    this.replaceChildren(...children)
  }
}

customElements.define("bruh-display-name", BruhDisplayName)

declare global {
  interface HTMLElementTagNameMap {
    "bruh-display-name": BruhDisplayName
  }
}
declare module "html-info" {
  interface HTMLTagToAttributes {
    "bruh-display-name": {
      "code": string,
      /**
       * Space separated list of locales
       */
      "locales"?: string,
      "locale-matcher"?: Intl.DisplayNamesOptions["localeMatcher"],
      "format-style"?: Intl.DisplayNamesOptions["style"],
      "type": Intl.DisplayNamesOptions["type"],
      "language-display"?: Intl.DisplayNamesOptions["languageDisplay"]
    }
  }
}
