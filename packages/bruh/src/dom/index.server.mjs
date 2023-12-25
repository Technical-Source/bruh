import { makePromiseQueue } from "../util/index.mjs"

export const isMetaNode      = Symbol.for("bruh meta node")
export const isMetaTextNode  = Symbol.for("bruh meta text node")
export const isMetaElement   = Symbol.for("bruh meta element")
export const isMetaRawString = Symbol.for("bruh meta raw string")

//#region HTML syntax functions

// https://html.spec.whatwg.org/multipage/syntax.html#void-elements
const voidElements = new Set([
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
])

const isVoidElement = element =>
  voidElements.has(element)

// https://html.spec.whatwg.org/multipage/syntax.html#elements-2
// https://html.spec.whatwg.org/multipage/syntax.html#cdata-rcdata-restrictions
// Does not work for https://html.spec.whatwg.org/multipage/syntax.html#raw-text-elements (script and style)
const escapeForElement = x =>
  (x + "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")

// https://html.spec.whatwg.org/multipage/syntax.html#syntax-attribute-value
const escapeForDoubleQuotedAttribute = x =>
  (x + "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")

// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
function * attributesToIterator(attributes) {
  for (const name in attributes) {
    const value = attributes[name]

    if (value instanceof Promise) {
      yield value
        .then(resolved => attributesToIterator({ [name]: resolved }))
        .catch(rejected => {
          console.error(rejected)
          return
        })
      continue
    }

    if (value == null || value === false)
      continue

    yield ` ${name}`

    if (value === true || value === "")
      continue

    yield `="${escapeForDoubleQuotedAttribute(value)}"`
  }
}

//#endregion

// A basic check for if a value is allowed as a meta node's child
// It's responsible for quickly checking the type, not deep validation
const isMetaChild = x =>
  // meta nodes, raw strings, and promises
  x?.[isMetaNode] ||
  x?.[isMetaRawString] ||
  x instanceof Promise ||
  // Any array, just assume it contains valid children
  Array.isArray(x) ||
  // Allow nullish
  x == null ||
  // Disallow functions and objects
  !(typeof x === "function" || typeof x === "object")
  // Everything else can be a child when stringified

class StreamableContent {
  async * [Symbol.asyncIterator]() {
    for await (const content of this[Symbol.iterator]()) {
      if (content == null)
        continue
      else if (content[Symbol.asyncIterator])
        yield* content[Symbol.asyncIterator]()
      else if (content[Symbol.iterator])
        yield* content[Symbol.iterator]()
      else
        yield content
    }
  }

  toString({ promise }) {

  }
}

//#region Meta Nodes that act like lightweight rendering-oriented DOM nodes

// Text nodes have no individual HTML representation
// We emulate this with a custom element <bruh-textnode> with an inline style reset
// These elements can be hydrated very quickly and even be marked with a tag
export class MetaTextNode {
  [isMetaNode]     = true;
  [isMetaTextNode] = true

  textContent
  tag

  constructor(textContent) {
    this.textContent = textContent
  }

  * [Symbol.iterator]() {
    yield `<bruh-textnode style="all:unset;display:inline"`
    if (this.tag)
      yield* attributesToIterator({ tag: this.tag })
    yield ">"
    if (this.textContent instanceof Promise) {
      yield this.textContent
        .then(escapeForElement)
        .catch(rejected => {
          console.error(rejected)
          return
        })
    }
    else
      yield escapeForElement(this.textContent)
    yield "</bruh-textnode>"
  }

  toString() {
    return [...this].join("")
  }

  setTag(tag) {
    this.tag = tag

    return this
  }
}

// A light model of an element
export class MetaElement {
  [isMetaNode]    = true;
  [isMetaElement] = true

  name
  attributes = {}
  children = []

  constructor(name) {
    this.name = name
  }

  * content({ promise }) {
    // https://html.spec.whatwg.org/multipage/syntax.html#syntax-start-tag
    yield `<${this.name}`
    yield* attributesToIterator(this.attributes)
    yield ">"
    if (isVoidElement(this.name))
      return

    for (const child of this.children.flat(Infinity)) {
      if (child == null || typeof child === "boolean")
        continue
      if (child[isMetaNode])
        yield* child
      else if (child[isMetaRawString] || child[Symbol.asyncIterator])
        yield child
      else if (child instanceof Promise)
        yield child
          .catch(rejected => {
            console.error(rejected)
            return
          })
      else
        yield escapeForElement(child)
    }

    // https://html.spec.whatwg.org/multipage/syntax.html#end-tags
    yield `</${this.name}>`
  }

  toString() {
    return [...this].join("")
  }
}

// Raw strings can be meta element children, where they bypass string escaping
// This should be avoided in general, but is needed for unsupported HTML features
export class MetaRawString extends String {
  [isMetaRawString] = true

  constructor(string) {
    super(string)
  }
}

//#endregion

//#region Meta element helper functions e.g. applyAttributes()

// Merge style rules with an object
export const applyStyles = (element, styles) => {
  // Doesn't support proper escaping
  // https://www.w3.org/TR/css-syntax-3/#ref-for-parse-a-list-of-declarations%E2%91%A0
  // https://www.w3.org/TR/css-syntax-3/#typedef-ident-token
  const currentStyles = Object.fromEntries(
    (element.attributes.style || "")
      .split(";").filter(s => s.length)
      .map(declaration => declaration.split(":").map(s => s.trim()))
  )

  Object.entries(styles)
    .forEach(([property, value]) => {
      if (value !== undefined)
        currentStyles[property] = value
      else
        delete currentStyles[property]
    })

  element.attributes.style =
    Object.entries(currentStyles)
      .map(([property, value]) => `${property}:${value}`)
      .join(";")
}

// Merge classes with an object mapping from class names to booleans
export const applyClasses = (element, classes) => {
  // Doesn't support proper escaping
  // https://html.spec.whatwg.org/multipage/dom.html#global-attributes:classes-2
  const currentClasses = new Set(
    (element.attributes.class || "")
      .split(/\s+/).filter(s => s.length)
  )

  Object.entries(classes)
    .forEach(([name, value]) => {
      if (value)
        currentClasses.add(name)
      else
        currentClasses.delete(name)
    })

  element.attributes.class = [...currentClasses].join(" ")
}

// Merge attributes with an object
export const applyAttributes = (element, attributes) => {
  Object.entries(attributes)
    .forEach(([name, value]) => {
      if (value != null && value !== false)
        element.attributes[name] = value
      else
        delete element.attributes[name]
    })
}

//#endregion

//#region rawString(), t(), and e()

export const rawString = string =>
  new MetaRawString(string)

export const t = textContent =>
  new MetaTextNode(textContent)

export const e = name => (...variadic) => {
  const element = new MetaElement(name)

  if (variadic.length === 0)
    return element

  // If there are no props
  if (isMetaChild(variadic[0])) {
    element.children.push(...variadic)
    return element
  }

  // If props exist as the first variadic argument
  const [props, ...children] = variadic

  // The bruh prop is reserved for future use
  delete props.bruh

  // Apply overloaded props, if possible
  if (typeof props.style === "object") {
    applyStyles(element, props.style)
    delete props.style
  }
  if (typeof props.class === "object") {
    applyClasses(element, props.class)
    delete props.class
  }
  // The rest of the props are attributes
  applyAttributes(element, props)

  // Add the children to the element
  element.children.push(...children)
  return element
}

//#endregion

//#region JSX integration

// The function that jsx tags (except fragments) compile to
export const h = (nameOrComponent, props, ...children) => {
  // If we are making an element, this is just a wrapper of e()
  // This is likely when the JSX tag name begins with a lowercase character
  if (typeof nameOrComponent === "string") {
    const makeElement = e(nameOrComponent)
    return props
      ? makeElement(props, ...children)
      : makeElement(...children)
  }

  // It must be a component, then, as bruh components are just functions
  // Due to JSX, this would mean a function with only one parameter - props
  // This object includes the all of the normal props and a "children" key
  return nameOrComponent({ ...props, children })
}

// The JSX fragment is made into a bruh fragment (just an array)
export const JSXFragment = ({ children }) => children

//#endregion

export const replaceDeferredScriptContent
  = `"use strict";`
  + `customElements.define("bruh-deferred",class extends HTMLElement{`
  + "connectedCallback(){"
  + "const t=this.previousElementSibling;"
  + "document.getElementById(this.dataset.replace).replaceWith(t.content);"
  + "t.remove();"
  + "this.remove()"
  + "}"
  + "})"

// "Content-Security-Policy": `script-src '${replaceDeferredHash}'`
export const replaceDeferredHash =
  "sha512-+xpsela6B2jMNhk2cPpAgB4Z89EeB6yltQ208+kvcbUKlkg11dBjAlj2FbNFxeE0kqOuZhdVVldl3hz1yZD38Q=="

export function * makeDocument(metaNodeOrFunction) {
  // https://html.spec.whatwg.org/#the-doctype
  yield "<!doctype html>"
  if (metaNodeOrFunction[isMetaNode]) {
    const metaNode = metaNodeOrFunction
    yield* metaNode
    return
  }

  const documentFunction = metaNodeOrFunction

  const deferQueue = makePromiseQueue()
  let deferCount = 0
  const defer = ({ placeholder, content }) => {
    const id = "bruh-deferred-" + deferCount++
    deferQueue.enqueue(content.then(content => ({ id, content })))
    return placeholder(id)
  }

  // https://html.spec.whatwg.org/#parsing-main-afterbody:parse-errors-3
  // https://html.spec.whatwg.org/#the-after-after-body-insertion-mode:parse-errors
  // Should place deferred content before the closing </body> tag.
  // Placing after is defined to parse as if it was before the </body> anyways,
  // but it's technically a parse error and browsers are allowed to drop the content.
  const deferred = (async function * () {
    for await (const settled of deferQueue) {
      if (settled.status === "rejected") {
        console.error(settled.reason)
        continue
      }
      const { id, content } = settled.value
      yield h("template", undefined, content)
      yield h("bruh-deferred", { "data-replace": id })
    }
  })()

  yield* documentFunction({ defer, deferred })
}
