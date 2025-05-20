/** @jsxImportSource bruh/browser */
import { bruhChildrenToNodes, type BruhProps } from "bruh/browser"
import { r } from "../../reactive/index.mts"
import { attempt, mapObject } from "../../utils/index.mts"
import { spaceSeparated } from "../utils.mts"
import { BruhCustomElementBase } from "../custom-elements.mts"
import { inferDirection, parseLocales, userLanguages } from "./utils.mts"

// todo: reactive updating times / responding to current time using found setTimeout or requestAnimationFrame

/**
 * In minutes from UTC/GMT, same as `new Date().getTimezoneOffset()`, but for any time zone
 *
 * `undefined` if unknown
 */
export const getTimeZoneOffset = (timeZone?: string) => {
  if (timeZone === undefined)
    return new Date().getTimezoneOffset()

  const longOffset = new Intl.DateTimeFormat('en', {
    timeZone,
    timeZoneName: "longOffset"
  })
    .formatToParts(new Date())
    .find(part => part.type === "timeZoneName")?.value

  if (!longOffset)
    return

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

/**
 * Makes a date that has a UTC time set to the input date's local time in the given time zone
 */
export const localDateInUTC = (date: Date | number, timeZone: string) => {
  const offset = getTimeZoneOffset(timeZone)
  if (offset === undefined)
    return undefined

  return new Date((date as number) - offset * 60 * 1_000)
}

export const hideRedundantOptions = (
  originalFormatter: Intl.DateTimeFormat,
  {
    date,
    endDate,
    now = new Date()
  }: {
    date: Date,
    endDate?: Date,
    now?: Date
  }
) => {
  const resolvedOptions = originalFormatter.resolvedOptions() as Intl.ResolvedDateTimeFormatOptions & Intl.DateTimeFormatOptions
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

        const dateSameEra    =                       dateYear  < 1 === currentYear < 1
        const endDateSameEra = missingEndDate || (endDateYear! < 1 === currentYear < 1)
        if (dateSameEra && endDateSameEra) {
          delete minimizedOptions.era

          const dateSameYear    =                       dateYear  === currentYear
          const endDateSameYear = missingEndDate || (endDateYear! === currentYear)
          if (dateSameYear && endDateSameYear) {
            delete minimizedOptions.year

            const dateSameMonthAndDate    =                       dateMonth  === currentMonth &&    dateDate  === currentDate
            const endDateSameMonthAndDate = missingEndDate || (endDateMonth! === currentMonth && endDateDate! === currentDate)
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

export const parseDate = (unparsed?: string | null) => {
  if (unparsed == undefined)
    return

  if (unparsed === "")
    return { type: "now" } as const

  const date = new Date(unparsed)
  if (isFinite(date as any as number))
    return { type: "date", date } as const

  const numberThenDate = new Date(Number(unparsed))
  if (isFinite(numberThenDate as any as number))
    return { type: "date", date: numberThenDate } as const

  return { type: "unparsed", unparsed } as const
}

export type ParsedDate = ReturnType<typeof parseDate>

const optionToAttribute = {
  // locale options
  "localeMatcher": "locale-matcher",
  "calendar": "calendar",
  "numberingSystem": "numbering-system",
  "hour12": "hour12",
  "hourCycle": "hour-cycle",
  "timeZone": "time-zone",
  // style options
  "weekday": "weekday",
  "era": "era",
  "year": "year",
  "month": "month",
  "day": "day",
  "dayPeriod": "day-period",
  "hour": "hour",
  "minute": "minute",
  "second": "second",
  "fractionalSecondDigits": "fractional-second-digits",
  "timeZoneName": "time-zone-name",
  "formatMatcher": "format-matcher",
  // style shortcuts
  "dateStyle": "date-style",
  "timeStyle": "time-style"
} as const

type BruhDateTimeAttributes = {
  "date"?: ParsedDate,
  "end-date"?: ParsedDate,
  "locales"?: ReadonlyArray<Intl.UnicodeBCP47LocaleIdentifier>,
  "hide-redundant-options"?: boolean,
  "locale-matcher"?: Intl.DateTimeFormatOptions["localeMatcher"],
  "calendar"?: Intl.DateTimeFormatOptions["calendar"],
  "numbering-system"?: Intl.DateTimeFormatOptions["numberingSystem"],
  "hour12"?: Intl.DateTimeFormatOptions["hour12"],
  "hour-cycle"?: Intl.DateTimeFormatOptions["hourCycle"],
  "time-zone"?: Intl.DateTimeFormatOptions["timeZone"],
  "weekday"?: Intl.DateTimeFormatOptions["weekday"],
  "era"?: Intl.DateTimeFormatOptions["era"],
  "year"?: Intl.DateTimeFormatOptions["year"],
  "month"?: Intl.DateTimeFormatOptions["month"],
  "day"?: Intl.DateTimeFormatOptions["day"],
  "day-period"?: Intl.DateTimeFormatOptions["dayPeriod"],
  "hour"?: Intl.DateTimeFormatOptions["hour"],
  "minute"?: Intl.DateTimeFormatOptions["minute"],
  "second"?: Intl.DateTimeFormatOptions["second"],
  "fractional-second-digits"?: Intl.DateTimeFormatOptions["fractionalSecondDigits"],
  "time-zone-name"?: Intl.DateTimeFormatOptions["timeZoneName"],
  "format-matcher"?: Intl.DateTimeFormatOptions["formatMatcher"],
  "date-style"?: Intl.DateTimeFormatOptions["dateStyle"],
  "time-style"?: Intl.DateTimeFormatOptions["timeStyle"]
}

export class BruhDateTime extends BruhCustomElementBase<BruhDateTimeAttributes> {
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
      "hide-redundant-options": (v?: string | null) => v != undefined
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
      mapObject(optionToReactiveAttribute, ([option, attribute]) => [option, attribute.value || undefined]) as Partial<Intl.DateTimeFormatOptions>
    )

    this.#formatter = r([this.#locales, this.#options], () =>
      attempt(() => new Intl.DateTimeFormat(this.#locales.value, this.#options.value))
        ?? new Intl.DateTimeFormat(this.#locales.value)
    )

    const dateToFormat = this.bruh.attributes.date
    const rangeEndDateToFormat = this.bruh.attributes["end-date"]

    const renderParts = (parts: ReadonlyArray<Intl.DateTimeFormatPart>) =>
      parts.map(part =>
        <span class={`bruh-date-time-part bruh-date-time-part--${part.type}`}>{part.value}</span> as HTMLSpanElement
      )

    const renderSingle = (
      date: NonNullable<ParsedDate>,
      attributes?: BruhProps<"time">
    ) => {
      if (date.type === "unparsed")
        return <time {...attributes} datetime={date.unparsed}>{date.unparsed}</time> as HTMLTimeElement

      const value =
        date.type === "now"
          ? new Date()
          : date.date

      const formatter =
        this.bruh.attributes["hide-redundant-options"].value
          ? hideRedundantOptions(this.#formatter.value, { date: value })
          : this.#formatter.value

      const rendered = renderParts(formatter.formatToParts(value))
      return <time {...attributes} datetime={value.toISOString()}>{rendered}</time> as HTMLTimeElement
    }

    const renderRange = (start: NonNullable<ParsedDate>, end: NonNullable<ParsedDate>) => {
      const canRenderRangeDirectly =
        "formatRangeToParts" in this.#formatter.value
        && start.type !== "unparsed"
        && end.type   !== "unparsed"
      if (!canRenderRangeDirectly)
        return [
          renderSingle(start, { class: "bruh-date-time-source bruh-date-time-source--startRange" }),
          <span class="bruh-date-time-source bruh-date-time-source--shared">
            <span class="bruh-date-time-part bruh-date-time-part--literal"> – </span>
          </span> as HTMLSpanElement,
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
      const bySource = parts.reduce<Intl.DateTimeRangeFormatPart[][]>((bySource, part, i) => {
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
          return <time class={className} datetime={dateTime.toISOString()}>{rendered}</time> as HTMLTimeElement
        }
        else {
          return <span class={className}>{rendered}</span> as HTMLSpanElement
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

      return <bdi lang={locale} dir={direction}>{result}</bdi> as HTMLElement
    })
  }

  mountedCallback() {
    const children = bruhChildrenToNodes([this.#formatted])
    this.replaceChildren(...children)
  }
}

customElements.define("bruh-date-time", BruhDateTime)

declare global {
  interface HTMLElementTagNameMap {
    "bruh-date-time": BruhDateTime
  }
}
declare module "html-info" {
  interface HTMLTagToAttributes {
    "bruh-date-time": {
      "date"?: string
      "end-date"?: string
      /**
       * Space separated list of locales
       */
      "locales"?: string,
      "hide-redundant-options"?: boolean,
      "locale-matcher"?: Intl.DateTimeFormatOptions["localeMatcher"],
      "calendar"?: Intl.DateTimeFormatOptions["calendar"],
      "numbering-system"?: Intl.DateTimeFormatOptions["numberingSystem"],
      "hour12"?: Intl.DateTimeFormatOptions["hour12"],
      "hour-cycle"?: Intl.DateTimeFormatOptions["hourCycle"],
      "time-zone"?: Intl.DateTimeFormatOptions["timeZone"],
      "weekday"?: Intl.DateTimeFormatOptions["weekday"],
      "era"?: Intl.DateTimeFormatOptions["era"],
      "year"?: Intl.DateTimeFormatOptions["year"],
      "month"?: Intl.DateTimeFormatOptions["month"],
      "day"?: Intl.DateTimeFormatOptions["day"],
      "day-period"?: Intl.DateTimeFormatOptions["dayPeriod"],
      "hour"?: Intl.DateTimeFormatOptions["hour"],
      "minute"?: Intl.DateTimeFormatOptions["minute"],
      "second"?: Intl.DateTimeFormatOptions["second"],
      "fractional-second-digits"?: Intl.DateTimeFormatOptions["fractionalSecondDigits"] | `${Intl.DateTimeFormatOptions["fractionalSecondDigits"]}`,
      "time-zone-name"?: Intl.DateTimeFormatOptions["timeZoneName"],
      "format-matcher"?: Intl.DateTimeFormatOptions["formatMatcher"],
      "date-style"?: Intl.DateTimeFormatOptions["dateStyle"],
      "time-style"?: Intl.DateTimeFormatOptions["timeStyle"]
    }
  }
}
