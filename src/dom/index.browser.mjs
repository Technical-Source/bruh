import { reactiveDo } from "bruh/reactive"

// A basic check for if a value is allowed as a meta node's child
// It's responsible for quickly checking the type, not deep validation
const isMetaNodeChild = x =>
  x.isBruhMetaNode ||
  x.isBruhReactive ||
  x instanceof Node ||
  Array.isArray(x) ||
  (typeof x !== "object" && typeof x !== "function")

const nonReactiveToNode = (child, implicitTextNodes = false) => {
  if (child.isBruhMetaNode)
    return child.toNode()

  if (child instanceof Node)
    return child

  return implicitTextNodes
    ? child
    : document.createTextNode(child)
}

const childrenToNodes = children => {
  return children
    .flat(Infinity)
    .map(child => {
      if (!child.isBruhReactive)
        return nonReactiveToNode(child, true)

      let node = nonReactiveToNode(child.value)
      child.react(() => {
        const oldNode = node
        node = nonReactiveToNode(child.value)
        oldNode.replaceWith(node)
      })
      return node
    })
}



// Meta Nodes

export class MetaTextNode {
  constructor(textContent) {
    this.isBruhMetaNode =
    this.isBruhMetaTextNode = true

    if (textContent.isBruhReactive) {
      this.node = document.createTextNode(textContent.value)
      textContent.react(() => {
        this.node.textContent = textContent.value
      })
    }
    else {
      this.node = document.createTextNode(textContent)
    }
  }

  addProperties(properties = {}) {
    Object.assign(this.node, properties)

    return this
  }
}

export class MetaElement {
  constructor(name, namespace) {
    this.isBruhMetaNode =
    this.isBruhMetaElement = true

    this.node =
      namespace
        ? document.createElementNS(namespace, name)
        : document.createElement  (           name)
  }

  addProperties(properties = {}) {
    Object.assign(this.node, properties)

    return this
  }

  addAttributes(attributes = {}) {
    for (const name in attributes)
      reactiveDo(attributes[name], value => {
        this.node.setAttribute(name, value)
      })

    return this
  }

  addDataAttributes(dataAttributes = {}) {
    for (const name in dataAttributes)
      reactiveDo(dataAttributes[name], value => {
        this.node.dataset[name] = value
      })

    return this
  }

  before(...xs) {
    this.node.before(...childrenToNodes(xs))

    return this
  }

  prepend(...xs) {
    this.node.prepend(...childrenToNodes(xs))

    return this
  }

  append(...xs) {
    this.node.append(...childrenToNodes(xs))

    return this
  }

  after(...xs) {
    this.node.after(...childrenToNodes(xs))

    return this
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
