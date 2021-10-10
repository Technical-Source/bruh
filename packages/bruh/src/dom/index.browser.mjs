/** @typedef { import("./index.browser") } */

import { LiveFragment } from "./live-fragment.mjs"
import { reactiveDo } from "../reactive/index.mjs"
import { maybeDo } from "../util/index.mjs"

const isReactive     = Symbol.for("bruh reactive")
const isMetaNode     = Symbol.for("bruh meta node")
const isMetaTextNode = Symbol.for("bruh meta text node")
const isMetaElement  = Symbol.for("bruh meta element")

// A basic check for if a value is allowed as a meta node's child
// It's responsible for quickly checking the type, not deep validation
const isMetaNodeChild = x =>
  // meta nodes, reactives, and DOM nodes
  x?.[isMetaNode] ||
  x?.[isReactive] ||
  x instanceof Node ||
  // Any array, just assume it contains valid children
  Array.isArray(x) ||
  // Allow nullish
  x == null ||
  // Disallow functions and objects
  !(typeof x === "function" || typeof x === "object")
  // Everything else can be a child when stringified

const toNode = x => {
  if (x[isMetaNode])
    return x.node

  if (x instanceof Node)
    return x

  return document.createTextNode(x)
}

export const childrenToNodes = children =>
  children
    .flat(Infinity)
    .flatMap(child => {
      if (!child[isReactive])
        return [toNode(child)]

      if (Array.isArray(child.value)) {
        const liveFragment = new LiveFragment()
        child.addReaction(() => {
          liveFragment.replaceChildren(...childrenToNodes(child.value))
        })
        return [liveFragment.startMarker, ...childrenToNodes(child.value), liveFragment.endMarker]
      }

      let node = toNode(child.value)
      child.addReaction(() => {
        const oldNode = node
        node = toNode(child.value)
        oldNode.replaceWith(node)
      })
      return [node]
    })



// Meta Nodes

export class MetaTextNode {
  [isMetaNode]     = true;
  [isMetaTextNode] = true

  node

  constructor(textContent) {
    if (!textContent[isReactive]) {
      this.node = document.createTextNode(textContent)
      return
    }

    this.node = document.createTextNode(textContent.value)
    textContent.addReaction(() => {
      this.node.textContent = textContent.value
    })
  }

  addProperties(properties = {}) {
    Object.assign(this.node, properties)

    return this
  }
}

export class MetaElement {
  [isMetaNode]    = true;
  [isMetaElement] = true

  node

  constructor(name, namespace) {
    this.node =
      namespace
        ? document.createElementNS(namespace, name)
        : document.createElement  (           name)
  }

  static from(element) {
    const result = new this("div")
    result.node = element
    return result
  }

  addProperties(properties = {}) {
    Object.assign(this.node, properties)

    return this
  }

  addAttributes(attributes = {}) {
    for (const name in attributes)
      reactiveDo(attributes[name],
        maybeDo(
          value => this.node.setAttribute   (name, value),
          ()    => this.node.removeAttribute(name)
        )
      )

    return this
  }

  addDataAttributes(dataAttributes = {}) {
    for (const name in dataAttributes)
      reactiveDo(dataAttributes[name],
        maybeDo(
          value =>        this.node.dataset[name] = value,
          ()    => delete this.node.dataset[name]
        )
      )

    return this
  }

  addStyles(styles = {}) {
    for (const property in styles)
      reactiveDo(styles[property],
        maybeDo(
          value => this.node.style.setProperty   (property, value),
          ()    => this.node.style.removeProperty(property)
        )
      )

    return this
  }

  toggleClasses(classes = {}) {
    for (const name in classes)
      reactiveDo(classes[name],
        value => this.node.classList.toggle(name, value)
      )

    return this
  }

  before(...xs) {
    this.node.before(...childrenToNodes(xs))
  }

  prepend(...xs) {
    this.node.prepend(...childrenToNodes(xs))
  }

  append(...xs) {
    this.node.append(...childrenToNodes(xs))
  }

  after(...xs) {
    this.node.after(...childrenToNodes(xs))
  }

  replaceChildren(...xs) {
    this.node.replaceChildren(...childrenToNodes(xs))
  }

  replaceWith(...xs) {
    this.node.replaceWith(...childrenToNodes(xs))
  }
}



// Convenience functions

export const hydrateTextNodes = () => {
  const tagged = {}
  const bruhTextNodes = document.getElementsByTagName("bruh-textnode")

  for (const bruhTextNode of bruhTextNodes) {
    const textNode = document.createTextNode(bruhTextNode.textContent)

    if (bruhTextNode.dataset.tag)
      tagged[bruhTextNode.dataset.tag] = textNode

    bruhTextNode.replaceWith(textNode)
  }

  return tagged
}

const createMetaTextNode = textContent =>
  new MetaTextNode(textContent)

const createMetaElement = (name, namespace) => (...variadic) => {
  const meta = new MetaElement(name, namespace)

  // Implement optional attributes as first argument
  if (!isMetaNodeChild(variadic[0])) {
    const [attributes, ...children] = variadic
    meta.addAttributes(attributes)
    meta.append(children)
  }
  else {
    meta.append(variadic)
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
    meta.addAttributes(attributesOrProps || {})
    meta.append(children)

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
