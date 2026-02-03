/** @jsxImportSource bruh/browser */
import { bruhChildrenToNodes } from "bruh/browser"
import { Reactive, r } from "../../reactive/index.mts"
import { spaceSeparated } from "../utils.mts"
import { BruhCustomElementBase } from "../custom-elements.mts"
import { MemoMap } from "../misc.mts"

const clamp = (min: number, x: number, max: number) =>
  Math.min(Math.max(min, x), max)

const getHeadingLevel = (heading: HTMLHeadingElement) =>
  parseInt(heading.localName[1])

type SectionMetrics = {
  contentTop: number,
  contentBottom: number,
  visibleContentTop: number,
  visibleContentBottom: number
}

const getSectionMetrics = (
  headings: ReadonlyArray<HTMLHeadingElement>,
  container?: HTMLElement
) => {
  const metrics = new Map<HTMLHeadingElement, SectionMetrics>()

  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i]
    const currentLevel = getHeadingLevel(heading)

    let nextHeading: HTMLHeadingElement | undefined
    for (let j = i + 1; j < headings.length; j++) {
      const candidate = headings[j]
      const candidateLevel = getHeadingLevel(candidate)

      if (candidateLevel <= currentLevel) {
        nextHeading = candidate
        break
      }
    }

    const contentTop = heading.getBoundingClientRect().top
    const contentBottom =
      nextHeading?.getBoundingClientRect().top
      ?? (container ?? heading.parentElement)?.getBoundingClientRect().bottom
      ?? innerHeight

    const visibleContentTop    = clamp(0, contentTop,    innerHeight)
    const visibleContentBottom = clamp(0, contentBottom, innerHeight)

    metrics.set(heading, {
      contentTop,
      contentBottom,
      visibleContentTop,
      visibleContentBottom,
    })
  }

  return metrics
}

const getProportionalPromience = (
  {
    contentTop,
    contentBottom,
    visibleContentTop,
    visibleContentBottom
  }: SectionMetrics
) => {
  const contentHeight = contentBottom - contentTop
  const visibleContentHeight = visibleContentBottom - visibleContentTop

  if (visibleContentHeight === 0)
    return 0

  const visibleContentOverScreen = visibleContentHeight / innerHeight
  const proportionOfContentVisible = visibleContentHeight / contentHeight

  return Math.max(visibleContentOverScreen, proportionOfContentVisible)
}

/**
 * Cumulative Distribution Function over Kumaraswamy distribution (cheap and similar to beta)
 *
 * Corresponding PDF is `a * b * x ** (a - 1) * (1 - x ** a) ** (b - 1)`
 */
const kumaraswamyCDF = (
  a: number,
  b: number,
  /** Up to this point */
  x: number
) => 1 - (1 - x ** a) ** b

// We could have an e.g. 256 entry Float32Array of evenly split cached values
// for expensive CDFs, but this one is very fast

// I manually tuned these parameters to match what I thought looked accurate
// The center of attention is ~22.5% of the way down the screen
const a = 1.4
const b = 3

const getProbabilisticProminence = (
  {
    visibleContentTop,
    visibleContentBottom
  }: SectionMetrics
) =>
  kumaraswamyCDF(a, b, visibleContentBottom / innerHeight) -
  kumaraswamyCDF(a, b, visibleContentTop    / innerHeight)

const getProminences = ({
  headings,
  probabilisticInfluence = 1/10
}: {
  headings: ReadonlyArray<HTMLHeadingElement>,
  probabilisticInfluence?: number
}) => {
  const metrics = getSectionMetrics(headings)

  const prominences = new Map<HTMLHeadingElement, number>()

  let i = 0
  for (const [heading, sectionMetrics] of metrics) {
    let prominence: number

    const proportionalProminence = probabilisticInfluence !== 1
      ? getProportionalPromience(sectionMetrics)
      : undefined

    const probabilisticProminence = probabilisticInfluence !== 0
      ? getProbabilisticProminence(sectionMetrics)
      : undefined

    if (probabilisticInfluence === 0)
      prominence = proportionalProminence!
    else if (probabilisticInfluence === 1)
      prominence = probabilisticProminence!
    else
      prominence = (
        proportionalProminence!  ** (1 - probabilisticInfluence) *
        probabilisticProminence! ** probabilisticInfluence
      )

    prominences.set(heading, prominence)
    i++
  }

  return prominences
}


type BruhAsideTOCAttributes = {
  "headings"?: ReadonlyArray<string>,
  "container"?: string,
  "max-level": 2 | 3 |4 | 5 | 6
  "probabilistic-influence"?: number
}

export class BruhAsideTOC extends BruhCustomElementBase<BruhAsideTOCAttributes> {
  static observedAttributes = [
    "headings",
    "container",
    "max-level",
    "probabilistic-influence"
  ] as const

  static bruh = {
    parseAttributes: {
      headings: (s: string | null) => [...new Set(spaceSeparated(s))],

      container: (s: string | null) => s || undefined,

      "max-level": (s: string | null) => {
        const maxLevel = parseInt(s as string)
        return isNaN(maxLevel)
          ? 3
          : clamp(2, maxLevel, 6)
      },

      "probabilistic-influence": (s: string | null) => {
        const probabilisticInfluence = parseFloat(s as string)
        return isNaN(probabilisticInfluence)
          ? undefined
          : clamp(0, probabilisticInfluence, 1)
      }
    }
  }

  #prominences: Reactive<Map<HTMLHeadingElement, Reactive<number>> | undefined>
  #rendered

  constructor() {
    super()

    const headings = r(() =>
      this.bruh.attributes.headings.value
        ?.map(id => this.ownerDocument.getElementById(id))
        .filter((e): e is HTMLHeadingElement => {
          if (!(e instanceof HTMLHeadingElement))
            return false

          const level = getHeadingLevel(e)
          return level > 1 && level <= (this.bruh.attributes["max-level"].value ?? 2)
        })
    )

    const container = r(() =>
      this.bruh.attributes.container.value
        ? this.ownerDocument.getElementById(this.bruh.attributes.container.value) ?? undefined
        : undefined
    )

    const resizeOrScroll = r({ innerHeight, innerWidth, scrollY })
    const onResizeOrScroll = () => {
      resizeOrScroll.value = { innerHeight, innerWidth, scrollY }
    }
    addEventListener("resize", onResizeOrScroll, { passive: true })
    addEventListener("scroll", onResizeOrScroll, { passive: true })

    this.#prominences = r([headings, container, this.bruh.attributes["probabilistic-influence"], resizeOrScroll], () => {
      if (!headings.value?.length)
        return

      const prominences = getProminences({
        headings: headings.value,
        probabilisticInfluence: this.bruh.attributes["probabilistic-influence"].value
      })

      const oldValue = this.#prominences.value
      if (oldValue) {
        const oldHeadings = new Set(oldValue.keys())
        const newHeadings = new Set(prominences.keys())
        const didChange =
          [...newHeadings].some(h => !oldHeadings.has(h)) ||
          [...oldHeadings].some(h => !newHeadings.has(h))

        if (!didChange) {
          for (const [heading, prominence] of prominences)
            oldValue.get(heading)!.value = prominence

          return oldValue
        }
      }

      return new Map([...prominences].map(([heading, prominence]) => [heading, r(prominence)]))
    })

    this.#rendered = r(() => {
      const prominences = this.#prominences.value
      if (!prominences)
        return

      return (
        <ol>
          <MemoMap items={prominences} getKey={([heading]) => heading}>
            {([heading, prominence]) => {
              <li
                class={`bruh-aside-toc--level-${getHeadingLevel(heading)}`}
                style={{ "--prominence": prominence }}
              >
                <a href={`#${heading.id}`}>
                  {heading.textContent}
                </a>
              </li>
            }}
          </MemoMap>
        </ol>
      )
    }, { memoKey: () => !this.#prominences.value })
  }

  mountedCallback() {
    const children = bruhChildrenToNodes([this.#rendered])
    this.replaceChildren(...children)
  }
}

customElements.define("bruh-aside-toc", BruhAsideTOC)

declare global {
  interface HTMLElementTagNameMap {
    "bruh-aside-toc": BruhAsideTOC
  }
}
declare module "html-info" {
  interface HTMLTagToAttributes {
    "bruh-aside-toc": {
      /**
       * Space separated list of heading ids
       */
      "headings"?: ReadonlyArray<string>,
      /** Content container id */
      "container"?: string,
      "max-level"?: `${2 | 3 | 4 | 5 | 6}`
    }
  }
}
declare module "csstype" {
  interface PropertiesHyphen {
    "--prominence"?: number
  }
}
