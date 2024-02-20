import {
  bruhChildrenToNodes,
  h, // @jsx h
  JSXFragment, // @jsxFrag JSXFragment
} from "../../dom/index.browser.mjs"
import { r } from "../../reactive/index.mjs"
import { attempt, camelToDashCase, mapObject } from "../../util/index.mjs"
import { BruhCustomElementBase, spaceSeparated } from "../util.mjs"
import { inferDirection, parseLocales, userLanguages } from "./util.mjs"

// todo: reactive updating times / responding to current time using found setTimeout or requestAnimationFrame

// in minutes from UTC/GMT, same as `new Date().getTimezoneOffset()`, but for any time zone
// undefined if unknown
export const getTimeZoneOffset = timeZone => {
  if (timeZone === undefined)
    return new Date().getTimezoneOffset()

  const longOffset = new Intl.DateTimeFormat('en', {
    timeZone,
    timeZoneName: "longOffset"
  })
    .formatToParts(new Date())
    .find(part => part.type === "timeZoneName")?.value

  if (longOffset === "GMT" || longOffset === "UTC")
    return 0

  const [hoursUnparsed, minutesUnparsed] = longOffset.replace(/^(GMT|UTC)/, "").split(":")
  const hoursParsed = parseInt(hoursUnparsed)
  const minutesParsed =
    minutesUnparsed !== undefined
      ? Math.sign(hoursParsed) * parseInt(minutesUnparsed)
      : 0

  const inMinutes = -1 * (hoursParsed * 60 + minutesParsed)
  if (isFinite(inMinutes))
    return inMinutes
}

export const currentTimeZone = () =>
  new Intl.DateTimeFormat().resolvedOptions().timeZone

// Makes a date that has a UTC time set to the input date's local time in the given time zone
export const localDateInUTC = (date, timeZone) => {
  const offset = getTimeZoneOffset(timeZone)
  if (offset === undefined)
    return undefined

  return new Date(date - offset * 60 * 1_000)
}

const hideRedundantOptions = (originalFormatter, { date, endDate, now = new Date() } = {}) => {
  const resolvedOptions = originalFormatter.resolvedOptions()
  const minimizedOptions = { ...resolvedOptions }

  if (resolvedOptions.timeZone === currentTimeZone() || getTimeZoneOffset(resolvedOptions.timeZone) === getTimeZoneOffset())
    delete minimizedOptions.timeZoneName

  // https://tc39.es/ecma402/#table-datetimeformat-tolocaltime-record
  if (resolvedOptions.calendar === "gregory") {
    const timeZonedDate = localDateInUTC(date, resolvedOptions.timeZone)
    if (timeZonedDate !== undefined) {
      const dateYear  = timeZonedDate.getUTCFullYear()
      const dateMonth = timeZonedDate.getUTCMonth()
      const dateDate  = timeZonedDate.getUTCDate()

      const timeZonedEndDate =
        endDate !== undefined
          ? localDateInUTC(endDate, resolvedOptions.timeZone)
          : undefined
      const missingEndDate = timeZonedEndDate === undefined
      if (missingEndDate === (endDate === undefined)) {
        const endDateYear  = timeZonedEndDate?.getUTCFullYear()
        const endDateMonth = timeZonedEndDate?.getUTCMonth()
        const endDateDate  = timeZonedEndDate?.getUTCDate()

        const currentYear  = now.getFullYear()
        const currentMonth = now.getMonth()
        const currentDate  = now.getDate()

        const dateSameEra    =                       dateYear < 1 === currentYear < 1
        const endDateSameEra = missingEndDate || (endDateYear < 1 === currentYear < 1)
        if (dateSameEra && endDateSameEra) {
          delete minimizedOptions.era

          const dateSameYear    =                       dateYear === currentYear
          const endDateSameYear = missingEndDate || (endDateYear === currentYear)
          if (dateSameYear && endDateSameYear) {
            delete minimizedOptions.year

            const dateSameMonthAndDate    =                       dateMonth === currentMonth &&    dateDate === currentDate
            const endDateSameMonthAndDate = missingEndDate || (endDateMonth === currentMonth && endDateDate === currentDate)
            if (dateSameMonthAndDate && endDateSameMonthAndDate) {
              delete minimizedOptions.month
              delete minimizedOptions.day
              delete minimizedOptions.weekday
            }
          }
        }
      }
    }
  }

  return new Intl.DateTimeFormat(resolvedOptions.locale, minimizedOptions)
}

const parseDate = unparsed => {
  if (unparsed == undefined)
    return undefined

  if (unparsed === "")
    return { type: "now" }

  const date = new Date(unparsed)
  if (isFinite(date))
    return { type: "date", date }

  const numberThenDate = new Date(Number(unparsed))
  if (isFinite(numberThenDate))
    return { type: "date", date: numberThenDate }

  return { type: "unparsed", unparsed }
}

const optionNames = [
  // locale options
  "localeMatcher",
  "calendar",
  "numberingSystem",
  "hour12",
  "hourCycle",
  "timeZone",
  // style options
  "weekday",
  "era",
  "year",
  "month",
  "day",
  "dayPeriod",
  "hour",
  "minute",
  "second",
  "fractionalSecondDigits",
  "timeZoneName",
  "formatMatcher",
  // style shortcuts
  "dateStyle",
  "timeStyle"
]
const optionToAttribute = Object.fromEntries(
  optionNames.map(option => [option, camelToDashCase(option)])
)

export class BruhDateTime extends BruhCustomElementBase {
  static observedAttributes = [
    "date",
    "end-date",
    "locales",
    "hide-redundant-options",
    ...Object.values(optionToAttribute)
  ]

  static bruh = {
    parseAttributes: {
      date: parseDate,
      "end-date": parseDate,
      locales: spaceSeparated,
      "hide-redundant-options": v => v != undefined
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
      attempt(() => new Intl.DateTimeFormat(this.#locales.value, this.#options.value))
        ?? new Intl.DateTimeFormat(this.#locales.value)
    )

    const dateToFormat = this.bruh.attributes.date
    const rangeEndDateToFormat = this.bruh.attributes["end-date"]

    const renderParts = parts =>
      parts.map(part =>
        <span class={`bruh-date-time-part bruh-date-time-part--${part.type}`}>{part.value}</span>
      )

    const renderSingle = (date, attributes) => {
      if (date.type === "unparsed")
        return <time {...attributes} datetime={date.unparsed}>{date.unparsed}</time>

      const value =
        date.type === "now"
          ? new Date()
          : date.date

      const formatter =
        this.bruh.attributes["hide-redundant-options"].value
          ? hideRedundantOptions(this.#formatter.value, { date: value })
          : this.#formatter.value

      const rendered = renderParts(formatter.formatToParts(value))
      return <time {...attributes} datetime={value.toISOString()}>{rendered}</time>
    }

    const renderRange = (start, end) => {
      const canRenderRangeDirectly =
        "formatRangeToParts" in this.#formatter.value
        && start.type !== "unparsed"
        && end.type   !== "unparsed"
      if (!canRenderRangeDirectly)
        return [
          renderSingle(start, { class: "bruh-date-time-source bruh-date-time-source--startRange" }),
          <span class="bruh-date-time-source bruh-date-time-source--shared">
            <span class="bruh-date-time-part bruh-date-time-part--literal"> – </span>
          </span>,
          renderSingle(end, { class: "bruh-date-time-source bruh-date-time-source--endRange" })
        ]

      const startValue =
        start.type === "now"
          ? new Date()
          : start.date
      const endValue =
        end.type === "now"
          ? new Date()
          : end.date

      const formatter =
        this.bruh.attributes["hide-redundant-options"].value
          ? hideRedundantOptions(this.#formatter.value, { date: startValue, endDate: endValue })
          : this.#formatter.value

      const parts = formatter.formatRangeToParts(startValue, endValue)
      const bySource = parts.reduce((bySource, part, i) => {
        if (!i || parts[i - 1].source !== part.source)
          bySource.push([])
        bySource[bySource.length - 1].push(part)
        return bySource
      }, [])
      return bySource.map(parts => {
        const source = parts[0].source
        const className = `bruh-date-time-source bruh-date-time-source--${source}`
        const rendered = renderParts(parts)
        if (source === "startRange" || source === "endRange" || (source === "shared" && bySource.length === 1)) {
          const dateTime =
            source === "startRange"
              ? startValue
              : endValue
          return <time class={className} datetime={dateTime.toISOString()}>{rendered}</time>
        }
        else {
          return <span class={className}>{rendered}</span>
        }
      })
    }

    this.#formatted = r([this.#formatter, dateToFormat, rangeEndDateToFormat], () => {
      if (!dateToFormat.value)
        return

      const formatter = this.#formatter.value
      const { locale } = formatter.resolvedOptions()
      const direction = inferDirection(locale)

      const result =
        rangeEndDateToFormat.value
          ? renderRange(dateToFormat.value, rangeEndDateToFormat.value)
          : renderSingle(dateToFormat.value)

      return <bdi lang={locale} dir={direction}>{result}</bdi>
    })
  }

  mountedCallback() {
    const children = bruhChildrenToNodes([this.#formatted])
    this.replaceChildren(...children)
  }
}

customElements.define("bruh-date-time", BruhDateTime)
