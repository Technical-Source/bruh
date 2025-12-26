/** @jsxImportSource bruh/browser */
import { bruhChildrenToNodes } from "bruh/browser"
import { r } from "../../reactive/index.mts"
import { attempt, mapObject } from "../../utils/index.mts"
import { spaceSeparated } from "../utils.mts"
import { BruhCustomElementBase } from "../custom-elements.mts"
import { inferDirection, parseLocales, userLanguages } from "./utils.mts"

const optionToAttribute = {
  "locale-matcher": "locale-matcher",
  "type": "type",
  "style": "format-style"
} as const

type BruhListAttributes = {
  "locales"?: ReadonlyArray<Intl.UnicodeBCP47LocaleIdentifier>,
  "locale-matcher"?: Intl.ListFormatOptions["localeMatcher"],
  "type"?: Intl.ListFormatOptions["type"],
  "format-style"?: Intl.ListFormatOptions["style"]
}

export class BruhList extends BruhCustomElementBase<BruhListAttributes> {
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
  #itemSlotNames = r<ReadonlyArray<`${number}`>>()
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
      mapObject(optionToReactiveAttribute, ([option, attribute]) => [option, attribute.value || undefined]) as Partial<Intl.ListFormatOptions>
    )

    this.#formatter = r([this.#locales, this.#options], () =>
      attempt(() => new Intl.ListFormat(this.#locales.value, this.#options.value))
        ?? new Intl.ListFormat(this.#locales.value)
    )

    type ListFormatPart = ReturnType<Intl.ListFormat["formatToParts"]>[number]
    const renderParts = (parts: ReadonlyArray<ListFormatPart>) =>
      parts.map(part => {
        const partAttribute = `part ${part.type}`
        return part.type === "element"
          ? <bdi  part={partAttribute} role="listitem"><slot name={part.value} /></bdi> as HTMLElement
          : <span part={partAttribute}>{part.value}</span> as HTMLSpanElement
      })

    this.#formatted = r([this.#formatter, this.#itemSlotNames], () => {
      if (!this.#itemSlotNames.value)
        return

      const formatter = this.#formatter.value
      const { locale } = formatter.resolvedOptions()
      const direction = inferDirection(locale)

      const result = renderParts(formatter.formatToParts(this.#itemSlotNames.value))

      return <bdi lang={locale} dir={direction} role="list">{result}</bdi> as HTMLElement
    })

    const shadowContent = bruhChildrenToNodes([this.#formatted])
    this
      .attachShadow({ mode: "open" })
      .append(...shadowContent)
  }

  mountedCallback() {
    const assignSlots = () => {
      this.#itemSlotNames.value = [...this.children].map((child, i) => {
        const slot = "" + (i + 1) as `${number}`
        child.slot = slot
        return slot
      })
    }
    assignSlots()
    new MutationObserver(assignSlots).observe(this, { childList: true })
  }
}

customElements.define("bruh-list", BruhList)

declare global {
  interface HTMLElementTagNameMap {
    "bruh-list": BruhList
  }
}
declare module "html-info" {
  interface HTMLTagToAttributes {
    "bruh-list": {
      /**
       * Space separated list of locales
       */
      "locales"?: string,
      "locale-matcher"?: Intl.ListFormatOptions["localeMatcher"],
      "type"?: Intl.ListFormatOptions["type"],
      "format-style"?: Intl.ListFormatOptions["style"]
    }
  }
}
