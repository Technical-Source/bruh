import { r } from "../../reactive/index.mjs"
import { attempt, currentUrl, unique } from "../../util/index.mjs"

export const parseLocale = locale => {
  if (locale)
    return attempt(() => new Intl.Locale(locale))
}

export const parseLocales = locales => {
  if (Array.isArray(locales))
    return unique(
      locales.map(parseLocale).filter(locale => locale),
      locale => locale + ""
    )

  const parsed = parseLocale(locales)
  if (parsed)
    return [parsed]

  return []
}

export const parseRegion = region => {
  if (region)
    return attempt(() => new Intl.Locale("xx", { region }).region)
}

export const inferRegion = locale =>
  parseLocale(locale)?.maximize().region

// https://raw.githubusercontent.com/unicode-org/cldr/main/common/properties/scriptMetadata.txt
// document.body.textContent.split("\n")
//   .map(line => line.trim())
//   .filter(line => line && !line.startsWith("#"))
//   .reduce((scripts, line) => {
//     const columns = line.split(";")
//       .map(column => column.trim())
//     const script = columns[0]
//     const rtl = columns[6]
//     if (rtl === "YES")
//       scripts.push(script)
//     return scripts
//   }, [])
const rtlScripts = new Set([
  "Arab", "Hebr", "Thaa", "Adlm", "Armi", "Avst", "Chrs",
  "Cprt", "Elym", "Hatr", "Hung", "Khar", "Lydi", "Mand",
  "Mani", "Mend", "Merc", "Mero", "Narb", "Nbat", "Nkoo",
  "Orkh", "Ougr", "Palm", "Phli", "Phlp", "Phnx", "Prti",
  "Rohg", "Samr", "Sarb", "Sogd", "Sogo", "Syrc", "Yezi"
])
export const inferDirection = locale => {
  const parsed = parseLocale(locale)
  if (!parsed)
    return

  const textInfo = parsed.getTextInfo?.() ?? parsed.textInfo
  if (textInfo?.direction)
    return textInfo.direction

  const { script } = parsed.maximize()
  if (script)
    return rtlScripts.has(script)
      ? "rtl"
      : "ltr"
}

export const languageDisplayName = (displayNames, language) => {
  const parsed = parseLocale(language)
  if (!parsed)
    return language + ""

  for (const code of [parsed + "", parsed.baseName, parsed.language]) {
    const display = attempt(() => displayNames.of(code))
    if (display && display !== code)
      return display
  }

  return parsed + ""
}

// Returns an array of progressively generalized locales
// Based on https://tc39.es/ecma402/#sec-bestavailablelocale (RFC 4647, section 3.4)
export const generalizedLocales = locale => {
  const result = []

  let generalized = locale + ""
  do {
    result.push(generalized)

    let lastDashIndex = generalized.lastIndexOf("-")
    if (lastDashIndex === -1)
      break

    if (lastDashIndex >= 2 && generalized[lastDashIndex - 2] === "-")
      lastDashIndex -= 2

    generalized = generalized.slice(0, lastDashIndex)
  } while (true)

  return parseLocales(result)
}

export const bestAvailableLocales = (available, preferred) => {
  const canonicalAvailable = parseLocales(available).map(locale => locale + "")
  const generalizedAvailable = new Map()
  for (const full of canonicalAvailable) {
    const canonicalGeneralized = generalizedLocales(full).map(locale => locale + "")
    for (const generalized of canonicalGeneralized) {
      if (!generalizedAvailable.has(generalized) || generalized === full)
        generalizedAvailable[generalized] = full
    }
  }

  const canonicalPreferred = parseLocales(preferred).map(locale => locale + "")
  const generalizedPreferred = new Set()
  for (const full of canonicalPreferred) {
    const canonicalGeneralized = generalizedLocales(full).map(locale => locale + "")
    for (const generalized of canonicalGeneralized) {
      // last write wins set
      if (generalizedPreferred.has(generalized))
        generalizedPreferred.delete(generalized)

      generalizedPreferred.add(generalized)
    }
  }

  const matches = new Set([...generalizedPreferred].map(gp => generalizedAvailable[gp]))
  const alsoAvailable = canonicalAvailable.filter(other => !matches.has(other))

  return {
    matches: parseLocales([...matches]),
    alsoAvailable: parseLocales(alsoAvailable)
  }
}

export const browserLanguages = r()
const reflectLanguages = () => {
  browserLanguages.value = parseLocales(navigator.languages)
}
reflectLanguages()
addEventListener("languagechange", reflectLanguages)

export const languagePickerLanguages = r()
const reflectLanguagePickerLanguages = () => {
  languagePickerLanguages.value = parseLocales(
    attempt(() =>
      JSON.parse(
        localStorage.getItem("bruh-language-picker-languages")
      )
    )
  )
}
reflectLanguagePickerLanguages()
addEventListener("storage", reflectLanguagePickerLanguages) // only accounts for changes on different windows

const userLocales = r([currentUrl], () => parseLocales(currentUrl.value.searchParams.getAll("locale")))
export const userLanguages = r([currentUrl, userLocales, languagePickerLanguages, browserLanguages], () => [
  ...parseLocales(currentUrl.value.searchParams.getAll("language")),
  ...userLocales.value,
  ...languagePickerLanguages.value,
  ...browserLanguages.value
])
export const userRegion = r([currentUrl, userLocales], () =>
  parseRegion(currentUrl.value.searchParams.get("region")) ?? inferRegion(userLocales.value[0])
)


const segment = (content, locales, options) =>
  [...new Intl.Segmenter(locales, options).segment(content)]

export const segmentTree = (locales, content) =>
  segment(content, locales, { granularity: "sentence" }).map(sentence =>
    ({
      type: "sentence",
      content: segment(sentence.segment, locales, { granularity: "word" }).map(word => {
        const graphemes =
          segment(word.segment, locales, { granularity: "grapheme" }).map(grapheme =>
            ({
              type: "grapheme",
              content: grapheme.segment
            })
          )
        return word.isWordLike
            ? {
              type: "word",
              content: graphemes
            }
            : graphemes
      })
    })
  )
