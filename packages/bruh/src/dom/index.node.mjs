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

const isMetaNode      = Symbol.for("bruh meta node")
const isMetaTextNode  = Symbol.for("bruh meta text node")
const isMetaElement   = Symbol.for("bruh meta element")
const isMetaRawString = Symbol.for("bruh meta raw string")

// A basic check for if a value is allowed as a meta node's child
// It's responsible for quickly checking the type, not deep validation
const isMetaNodeChild = x =>
  // meta nodes, reactives, and DOM nodes
  x?.[isMetaNode] ||
  x?.[isMetaRawString] ||
  // Any array, just assume it contains valid children
  Array.isArray(x) ||
  // Everything else, as long as it isn't a function, can be a child when stringified
  typeof x !== "function"


// Meta Nodes

export class MetaTextNode {
  [isMetaNode]     = true;
  [isMetaTextNode] = true

  textContent
  tag

  constructor(textContent) {
    this.textContent = textContent
  }

  toString() {
    return `<bruh-textnode style="all:unset;display:inline"${
      this.tag
        ? ` data-tag="${escapeForDoubleQuotedAttribute(this.tag)}"`
        : ""
    }>${ escapeForElement(this.textContent) }</bruh-textnode>`
  }

  setTag(tag = "") {
    this.tag = tag

    return this
  }
}

export class MetaElement {
  [isMetaNode]    = true;
  [isMetaElement] = true

  name
  attributes = {}
  children = []

  constructor(name) {
    this.name = name
  }

  toString() {
    // https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
    const attributes =
      Object.entries(this.attributes)
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
          return (child[isMetaNode] || child[isMetaRawString])
            ? child.toString()
            : escapeForElement(child)
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
    Object.entries(dataAttributes)
      .forEach(([name, value]) => {
        // https://html.spec.whatwg.org/multipage/dom.html#dom-domstringmap-setitem
        const skewered = name.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
        this.attributes[`data-${skewered}`] = value
      })

    return this
  }

  addStyles(styles = {}) {
    // Doesn't support proper escaping
    // https://www.w3.org/TR/css-syntax-3/#ref-for-parse-a-list-of-declarations%E2%91%A0
    // https://www.w3.org/TR/css-syntax-3/#typedef-ident-token
    const currentStyles = Object.fromEntries(
      (this.attributes.style || "")
        .split(";").filter(s => s.length)
        .map(declaration => declaration.split(":").map(s => s.trim()))
    )

    Object.assign(currentStyles, styles)

    this.attributes.style =
      Object.entries(currentStyles)
        .map(([property, value]) => `${property}:${value}`)
        .join(";")

    return this
  }

  toggleClasses(classes = {}) {
    // Doesn't support proper escaping
    // https://html.spec.whatwg.org/multipage/dom.html#global-attributes:classes-2
    const classList = new Set(
      (this.attributes.class || "")
        .split(/\s+/).filter(s => s.length)
    )

    Object.entries(classes)
      .forEach(([name, value]) => {
        if (value)
          classList.add(name)
        else
          classList.delete(name)
      })

    this.attributes.class = Array.from(classList).join(" ")

    return this
  }
}

export class MetaRawString {
  [isMetaRawString] = true

  string

  constructor(string) {
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
