import { r } from "../reactive/index.mjs"
import { attempt } from "../util/index.mjs"

export class BruhCustomElementBase extends HTMLElement {
  bruh = {
    attributes: {}
  }

  #setBruhAttribute(name, value = this.getAttribute(name)) {
    this.bruh.attributes[name] ??= r()
    const parse = this.constructor.bruh?.parseAttributes?.[name]
    this.bruh.attributes[name].value =
      parse
        ? attempt(() => parse(value), e => e)
        : value
  }

  constructor() {
    super()

    if (this.constructor.observedAttributes)
      for (const name of this.constructor.observedAttributes)
        this.#setBruhAttribute(name)
  }

  attributeChangedCallback(name, _, value) {
    this.#setBruhAttribute(name, value)
  }

  #mounted = false
  connectedCallback() {
    if (!this.#mounted) {
      this.mountedCallback?.()
      this.#mounted = true
    }
  }
}

// https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#space-separated-tokens
export const spaceSeparated = s =>
  s
    ?.trim()
    .split(/\s+/)
    .map(t => t.trim())
