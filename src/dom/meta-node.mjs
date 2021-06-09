import { pipe } from "../util/index.mjs"
import { run, zipWith } from "../util/iterable/sync.mjs"

// https://html.spec.whatwg.org/multipage/syntax.html#void-elements
const isVoidElement = element =>
  [
    "base",
    "link",
    "meta",

    "hr",
    "br",
    "wbr",

    "area",
    "img",
    "track",

    "embed",
    "param",
    "source",
    
    "col",
    
    "input"
  ].includes(element)

// https://html.spec.whatwg.org/multipage/syntax.html#elements-2
// https://html.spec.whatwg.org/multipage/syntax.html#cdata-rcdata-restrictions
const escapeForElement = string =>
  string
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")

// https://html.spec.whatwg.org/multipage/syntax.html#syntax-attribute-value
const escapeForDoubleQuotedAttribute = string =>
  string
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")

const isAttributes = x =>
  !(x instanceof MetaNode || x instanceof MetaRawString) &&
  typeof x == "object"


// Meta Nodes

export class MetaNode {
  constructor() {
    this.properties = {}
    this.onHydrate = () => {}
    this.hydrateTag = undefined
  }

  toString() {}

  toNode() {}

  addProperties(properties = {}) {
    Object.assign(this.properties, properties)

    return this
  }

  setOnHydrate(f = () => {}) {
    this.onHydrate = f

    return this
  }

  hydrate() {}

  setHydrateTag(tag = "") {
    this.hydrateTag = tag

    return this
  }
}

export class MetaTextNode extends MetaNode {
  constructor(textContent) {
    super()
    this.textContent = textContent
  }

  toString() {
    return `<bruh-textnode style="all:unset;display:inline" ${
      this.hydrateTag
        ? `data-bruh-hydrate="${escapeForDoubleQuotedAttribute(this.hydrateTag)}"`
        : ""
    }>${
      escapeForElement(this.textContent.toString())
    }</bruh-textnode>`
  }

  toNode() {
    const node = document.createTextNode(this.textContent)

    Object.assign(node, this.properties)
    this.onHydrate(node)

    return node
  }

  hydrate(node) {
    const replacement = this.toNode()
    node.replaceWith(replacement)
    return replacement
  }
}

export class MetaElement extends MetaNode {
  constructor(name, namespace) {
    super()
    this.name = name
    this.namespace = namespace
    this.children = []

    this.attributes = {}
    this.dataset = {}
  }

  toString() {
    const datasetWithHydrateTag =
      this.hydrateTag
        ? Object.assign({}, this.dataset, { bruhHydrate: this.hydrateTag })
        : this.dataset
    // https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
    const attributes =
      [
        ...Object.entries(this.attributes),
        ...Object.entries(datasetWithHydrateTag)
          .map(([name, value]) => {
            // https://html.spec.whatwg.org/multipage/dom.html#dom-domstringmap-setitem
            const skewered = name.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
            return [`data-${skewered}`, value]
          })
      ]
        .map(([name, value]) =>
          value == ""
            ? ` ${name}`
            : ` ${name}="${escapeForDoubleQuotedAttribute(value + "")}"`
        ).join("")
    // https://html.spec.whatwg.org/multipage/syntax.html#syntax-start-tag
    const startTag = `<${this.name}${attributes}>`

    if (isVoidElement(this.name))
      return startTag
    else {
      const contents =
        this.children
          .map(child =>
            (child instanceof MetaNode || child instanceof MetaRawString)
              ? child.toString()
              : escapeForElement(child + "")
          ).join("")
      // https://html.spec.whatwg.org/multipage/syntax.html#end-tags
      const endTag = `</${this.name}>`
      return startTag + contents + endTag
    }
  }

  toNode() {
    const node =
      this.namespace
        ? document.createElementNS(this.namespace, this.name)
        : document.createElement  (                this.name)

    // Add children
    node.append(...this.children
      .map(child =>
        child instanceof MetaNode
          ? child.toNode()
          : child + "" // Coerce to a string to become a bare text node
      )
    )
    // Assign properties, attributes, dataset, and run onHydrate
    Object.assign(node, this.properties)
    Object.entries(this.attributes)
      .forEach(([name, value]) => node.setAttribute(name, value))
    Object.assign(node.dataset, this.dataset)

    this.onHydrate(node)

    return node
  }

  addAttributes(attributes = {}) {
    Object.assign(this.attributes, attributes)

    return this
  }

  addDataAttributes(dataAttributes = {}) {
    Object.assign(this.dataset, dataAttributes)

    return this
  }

  prepend(...xs) {
    this.children.unshift(...xs)

    return this
  }

  append(...xs) {
    this.children.push(...xs)

    return this
  }

  hydrate(node) {
    // TODO: make this element replacement check have solid requirements
    const shouldReplace = node.localName != this.name
  
    if (shouldReplace) {
      const replacement = this.toNode()
      node.replaceWith(replacement)
      node = replacement
    }
    else {
      Object.assign(node, this.properties)
  
      // Zip meta children and DOM children with .hydrate()
      pipe(
        [
          this.children
            .filter(child => child instanceof MetaNode), // Ignore bare text nodes
          node.children
        ],
        zipWith((childMetaNode, childNode) => childMetaNode.hydrate(childNode)),
        run
      )
  
      metaNode.onHydrate(node)
    }

    return node
  }
}

export class MetaRawString {
  constructor(string) {
    this.string = string
  }

  toString() {
    return this.string
  }
}

// Convenience functions

export const t = textContent =>
  new MetaTextNode(textContent)

export const e = (name, namespace) => (...variadic) => {
  const meta = new MetaElement(name, namespace)

  // Implement optional attributes as first argument
  if (variadic[0] && isAttributes(variadic[0]))
    [meta.attributes, ...meta.children] = variadic
  else {
    meta.attributes = {}
    meta.children = variadic
  }

  return meta
}

export const rawString = string =>
  new MetaRawString(string)
