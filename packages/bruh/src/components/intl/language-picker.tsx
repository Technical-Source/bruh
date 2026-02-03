/** @jsxImportSource bruh/browser */
import type { BruhChild } from "bruh/browser"
import { r, type Reactive } from "../../reactive/index.mts"
import { spaceSeparated } from "../utils.mts"
import { BruhCustomElementBase } from "../custom-elements.mts"
import { inferDirection, languageDisplayName, bestAvailableLocales, parseLocales, userLanguages, languagePickerLanguages, type InputLocale } from "./utils.mts"

const userLanguageDisplayNames = r(() =>
  new Intl.DisplayNames(userLanguages.value, { type: "language" })
)

type Option = {
  native: {
    name: string | undefined,
    language: string,
    direction: "ltr" | "rtl" | undefined
  },
  current: {
    name: string,
    language: string,
    direction: "ltr" | "rtl" | undefined
  }
}

const makeOptionElement = ({ native, current }: Option) => {
  const currentElement = <bdi lang={current.language} dir={current.direction}>{current.name}</bdi> as HTMLElement

  let friendly: BruhChild
  if (native.name === undefined || native.name === current.name)
    friendly = currentElement
  else {
    const nativeElement = <bdi lang={native.language} dir={native.direction}>{native.name}</bdi> as HTMLElement
    friendly = <>{nativeElement} — {currentElement}</>
  }

  const isSelected = r(() => native.language === userLanguages.value[0] + "" || undefined)

  const directionOverride =
    native.name && native.direction !== current.direction
      ? native.direction
      : undefined

  const option: HTMLOptionElement =
    <option value={native.language} selected={isSelected} dir={directionOverride}>
      {friendly}
    </option>

  return option
}

const SelectLanguage = (
  {
    languages,
    name = "language"
  }: {
    languages: Reactive<ReadonlyArray<InputLocale>>,
    name?: string
  }
) => {
  const options = r(() => {
    const currentLanguage = userLanguageDisplayNames.value.resolvedOptions().locale
    const currentDirection = inferDirection(currentLanguage)

    const { matches, alsoAvailable } = bestAvailableLocales(languages.value, userLanguages.value)

    const makeOption = (language: Intl.Locale): Option => {
      const nativeNameSupported = Intl.DisplayNames.supportedLocalesOf(language).length > 0
      return {
        native: {
          name:
            nativeNameSupported
              ? languageDisplayName(new Intl.DisplayNames(language, { type: "language" }), language)
              : undefined,
          language: language + "",
          direction: inferDirection(language)
        },
        current: {
          name: languageDisplayName(userLanguageDisplayNames.value, language),
          language: currentLanguage,
          direction: currentDirection
        }
      }
    }

    const { compare } = new Intl.Collator(userLanguages.value, { usage: "sort" })

    return {
      matches: matches.map(makeOption),
      alsoAvailable: alsoAvailable.map(makeOption)
        .sort((a, b) => {
          const aName = a.native.name ?? a.current.name
          const bName = b.native.name ?? b.current.name
          return compare(aName, bName)
        })
    }
  })

  const selectOptions = r(() => {
    const matches = options.value.matches.map(makeOptionElement)
    const alsoAvailable = options.value.alsoAvailable.map(makeOptionElement)

    if (matches.length && alsoAvailable.length)
      return [...matches, <hr /> as HTMLHRElement, ...alsoAvailable]
    else
      return [...matches, ...alsoAvailable]
  })

  const select =
    <select name={name}>
      {selectOptions}
    </select>

  return select
}

type BruhLanguagePickerAttributes = {
  "languages": ReadonlyArray<Intl.Locale>
}

export class BruhLanguagePicker extends BruhCustomElementBase<BruhLanguagePickerAttributes> {
  static observedAttributes = ["languages"]

  static bruh = {
    parseAttributes: {
      languages: spaceSeparated
    }
  }

  #languages = r(() => parseLocales(this.bruh.attributes.languages.value))

  #select

  constructor() {
    super()

    this.#select = <SelectLanguage languages={this.#languages} />
    this.#select.addEventListener("change", () => {
      languagePickerLanguages.value = parseLocales([this.#select.value])
      localStorage.setItem(
        "bruh-language-picker-languages",
        JSON.stringify(
          languagePickerLanguages.value
            .map(language => language + "")
        )
      )
    })
  }

  mountedCallback() {
    this.replaceChildren(this.#select)
  }
}

customElements.define("bruh-language-picker", BruhLanguagePicker)

declare global {
  interface HTMLElementTagNameMap {
    "bruh-language-picker": BruhLanguagePicker
  }
}
declare module "html-info" {
  interface HTMLTagToAttributes {
    "bruh-language-picker": {
      /**
       * Space separated list of locales
       */
      "languages": string
    }
  }
}
