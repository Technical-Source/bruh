import { flattenReactive } from "bruh/reactive"

// https://html.spec.whatwg.org/multipage/syntax.html#void-elements
const voidElements = [
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
]

const isVoidElement = element =>
  voidElements.includes(element)

// https://html.spec.whatwg.org/multipage/syntax.html#elements-2
// https://html.spec.whatwg.org/multipage/syntax.html#cdata-rcdata-restrictions
const escapeForElement = x =>
  (x + "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")

// https://html.spec.whatwg.org/multipage/syntax.html#syntax-attribute-value
const escapeForDoubleQuotedAttribute = x =>
  (x + "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")

// A basic check for if a value is allowed as a meta node's child
// It's responsible for quickly checking the type, not deep validation
const isMetaNodeChild = x =>
  x.isBruhMetaNode ||
  x.isBruhMetaRawString ||
  x.isBruhReactive ||
  Array.isArray(x) ||
  (typeof x !== "object" && typeof x !== "function")



// Meta Nodes

export class MetaTextNode {
  constructor(textContent) {
    this.isBruhMetaNode =
    this.isBruhMetaTextNode = true

    this.textContent = textContent
    this.tag = undefined
  }

  toString() {
    return `<bruh-textnode style="all:unset;display:inline"${
      this.tag
        ? ` data-tag="${escapeForDoubleQuotedAttribute(this.tag)}"`
        : ""
    }>${ escapeForElement(flattenReactive(this.textContent)) }</bruh-textnode>`
  }

  setTag(tag = "") {
    this.tag = tag

    return this
  }
}

export class MetaElement {
  constructor(name) {
    this.isBruhMetaNode =
    this.isBruhMetaElement = true

    this.name = name
    this.children = []

    this.attributes = {}
    this.dataset = {}
  }

  toString() {
    // https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
    const attributes =
      [
        ...Object.entries(this.attributes),
        ...Object.entries(this.dataset)
          .map(([name, value]) => {
            // https://html.spec.whatwg.org/multipage/dom.html#dom-domstringmap-setitem
            const skewered = name.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
            return [`data-${skewered}`, flattenReactive(value)]
          })
      ]
        .map(([name, value]) =>
          value === ""
            ? ` ${name}`
            : ` ${name}="${escapeForDoubleQuotedAttribute(value)}"`
        ).join("")
    // https://html.spec.whatwg.org/multipage/syntax.html#syntax-start-tag
    const startTag = `<${this.name}${attributes}>`

    if (isVoidElement(this.name))
      return startTag

    const contents =
      this.children
        .flat(Infinity)
        .map(child => {
          const c = flattenReactive(child)
          return (c.isBruhMetaNode || c.isBruhMetaRawString)
            ? c.toString()
            : escapeForElement(c)
        }).join("")
    // https://html.spec.whatwg.org/multipage/syntax.html#end-tags
    const endTag = `</${this.name}>`
    return startTag + contents + endTag
  }

  addAttributes(attributes = {}) {
    Object.assign(this.attributes, attributes)

    return this
  }

  addDataAttributes(dataAttributes = {}) {
    Object.assign(this.dataset, dataAttributes)

    return this
  }
}

export class MetaRawString {
  constructor(string) {
    this.isBruhMetaRawString = true
    this.string = string
  }

  toString() {
    return this.string
  }
}



// Convenience functions

export const rawString = string =>
  new MetaRawString(string)

const createMetaTextNode = textContent =>
  new MetaTextNode(textContent)

const createMetaElement = name => (...variadic) => {
  const meta = new MetaElement(name)

  // Implement optional attributes as first argument
  if (!isMetaNodeChild(variadic[0]))
    [meta.attributes, ...meta.children] = variadic
  else {
    meta.attributes = {}
    meta.children = variadic
  }

  return meta
}

// JSX integration
const createMetaElementJSX = (nameOrComponent, attributesOrProps, ...children) => {
  // If we are making a html element
  // This is likely when the jsx tag name begins with a lowercase character
  if (typeof nameOrComponent == "string") {
    const meta = new MetaElement(nameOrComponent)

    // These are attributes then, but they might be null/undefined
    meta.attributes = attributesOrProps || {}
    meta.children = children

    return meta
  }

  // It must be a component, then
  // Bruh components are just functions that return meta elements
  // Due to JSX, this would mean a function with only one parameter - a "props" object
  // This object includes the all of the attributes and a "children" key
  return nameOrComponent( Object.assign({}, attributesOrProps, { children }) )
}

// These will be called with short names
export {
  createMetaTextNode   as t,
  createMetaElement    as e,
  createMetaElementJSX as h
}

// The JSX fragment is made into a bruh fragment (just an array)
export const JSXFragment = ({ children }) => children
