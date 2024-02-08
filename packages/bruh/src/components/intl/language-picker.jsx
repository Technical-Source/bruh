import {
  h, // @jsx h
  JSXFragment // @jsxFrag JSXFragment
} from "../../dom/index.browser.mjs"
import { r } from "../../reactive/index.mjs"
import { BruhCustomElementBase, spaceSeparated } from "../util.mjs"
import { inferDirection, languageDisplayName, bestAvailableLocales, userLanguages, parseLocales, languagePickerLanguages } from "./util.mjs"

const userLanguageDisplayNames = r([userLanguages], () =>
  new Intl.DisplayNames(userLanguages.value, { type: "language" })
)

const SelectLanguage = ({ languages, name = "language" } = {}) => {
  const options = r([languages, userLanguages, userLanguageDisplayNames], () => {
    const currentLanguage = userLanguageDisplayNames.value.resolvedOptions().locale
    const currentDirection = inferDirection(currentLanguage)

    const { matches, alsoAvailable } = bestAvailableLocales(languages.value, userLanguages.value)

    const makeOption = language => {
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

  const selectOptions = r([options], () => {
    const makeOptionElement = ({ native, current }) => {
      const currentElement = <bdi lang={current.language} dir={current.direction}>{current.name}</bdi>

      let friendly
      if (native.name === undefined || native.name === current.name)
        friendly = currentElement
      else {
        const nativeElement = <bdi lang={native.language} dir={native.direction}>{native.name}</bdi>
        friendly = <>{nativeElement} — {currentElement}</>
      }

      const isSelected = r([userLanguages], () => native.language === userLanguages.value[0] || undefined)

      const directionOverride =
        native.name && native.direction !== current.direction
          ? native.direction
          : undefined

      const option =
        <option value={native.language} selected={isSelected} dir={directionOverride}>
          {friendly}
        </option>

      return option
    }

    const matches = options.value.matches.map(makeOptionElement)
    const alsoAvailable = options.value.alsoAvailable.map(makeOptionElement)

    if (matches.length && alsoAvailable.length)
      return [...matches, <hr />, ...alsoAvailable]
    else
      return [...matches, ...alsoAvailable]
  })

  const select =
    <select name={name}>
      {selectOptions}
    </select>

  return select
}

export class BruhLanguagePicker extends BruhCustomElementBase {
  static observedAttributes = ["languages"]

  static bruh = {
    parseAttributes: {
      languages: spaceSeparated
    }
  }

  #languages = r([this.bruh.attributes.languages], () => parseLocales(this.bruh.attributes.languages.value))

  constructor() {
    super()

    const select = <SelectLanguage languages={this.#languages} />
    select.addEventListener("change", () => {
      languagePickerLanguages.value = parseLocales([select.value])
      localStorage.setItem(
        "bruh-language-picker-languages",
        JSON.stringify(
          languagePickerLanguages.value
            .map(language => language + "")
        )
      )
    })

    this
      .attachShadow({ mode: "open" })
      .append(select)
  }
}

customElements.define("bruh-language-picker", BruhLanguagePicker)
