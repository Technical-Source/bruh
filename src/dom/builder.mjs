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
    .replace(/<\//g, "&lt;/")

// https://html.spec.whatwg.org/multipage/syntax.html#syntax-attribute-value
const escapeForDoubleQuotedAttribute = string =>
  string
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")

const isAttributes = x =>
  !(x instanceof NodeBuilder) &&
  typeof x == "object"

export class MetaNode {}
export class NodeBuilder {}

export class MetaTextNode extends MetaNode {
  constructor(textContent) {
    super()
    this.textContent = textContent

    this.bruhFunction = () => {}
    this.properties = {}
  }
}

export class MetaElement extends MetaNode {
  constructor(name, namespace) {
    super()
    this.name = name
    this.namespace = namespace
    this.childNodeBuilders = []

    this.bruhFunction = () => {}
    this.properties = {}
    this.attributes = {}
    this.dataset = {}
  }
}

export class TextNodeBuilder extends NodeBuilder {
  constructor(textContent) {
    super()
    this.metaNode = new MetaTextNode(textContent)
    this.node = undefined
  }

  toString() {
    return `<bruh-textnode style="all:unset;display:inline">${
      escapeForElement(this.metaNode.textContent.toString())
    }</bruh-textnode>`
  }

  toNode() {
    const node = document.createTextNode(this.metaNode.textContent)

    node.bruh = this.metaNode.bruhFunction(node)
    Object.assign(node, this.metaNode.properties)

    return node
  }

  bruh(f = () => {}) {
    this.metaNode.bruhFunction = f

    return this
  }

  properties(properties = {}) {
    Object.assign(this.metaNode.properties, properties)

    return this
  }
}

export class ElementBuilder extends NodeBuilder {
  constructor(name, namespace) {
    super()
    this.metaNode = new MetaElement(name, namespace)
    this.node = undefined
  }

  toString() {
    // https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
    const attributes =
      [
        ...Object.entries(this.metaNode.attributes),
        ...Object.entries(this.metaNode.dataset)
          .map(([name, value]) => {
            // https://html.spec.whatwg.org/multipage/dom.html#dom-domstringmap-setitem
            const skewered = name.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
            return [`data-${skewered}`, value]
          })
      ]
        .map(([name, value]) =>
          value == ""
            ? ` ${name}`
            : ` ${name}="${escapeForDoubleQuotedAttribute(value.toString())}"`
        ).join("")
    // https://html.spec.whatwg.org/multipage/syntax.html#syntax-start-tag
    const startTag = `<${this.metaNode.name}${attributes}>`

    if (isVoidElement(this.metaNode.name))
      return startTag
    else {
      const contents =
        this.metaNode.childNodeBuilders
          .map(cnb =>
            typeof cnb == "string"
              ? escapeForElement(cnb)
              : cnb.toString()
          ).join("")
      // https://html.spec.whatwg.org/multipage/syntax.html#end-tags
      const endTag = `</${this.metaNode.name}>`
      return startTag + contents + endTag
    }
  }

  toNode() {
    const node =
      this.metaNode.namespace
        ? document.createElementNS(this.metaNode.namespace, this.metaNode.name)
        : document.createElement  (                         this.metaNode.name)

    // Add children
    node.append(...this.metaNode.childNodeBuilders
      .map(cnb =>
        cnb instanceof NodeBuilder
          ? cnb.toNode()
          : cnb // Allow strings to become bare text nodes
      )
    )
    // Assign node.bruh, other properties, attributes, and dataset
    node.bruh = this.metaNode.bruhFunction(node)
    Object.assign(node, this.metaNode.properties)
    Object.entries(this.metaNode.attributes)
      .forEach(([name, value]) => node.setAttribute(name, value))
    Object.assign(node.dataset, this.metaNode.dataset)

    return node
  }

  bruh(f = () => {}) {
    this.metaNode.bruhFunction = f

    return this
  }

  properties(properties = {}) {
    Object.assign(this.metaNode.properties, properties)

    return this
  }

  attributes(attributes = {}) {
    Object.assign(this.metaNode.attributes, attributes)

    return this
  }

  data(dataAttributes = {}) {
    Object.assign(this.metaNode.dataset, dataAttributes)

    return this
  }

  prepend(...xs) {
    this.metaNode.childNodeBuilders.unshift(...xs)

    return this
  }

  append(...xs) {
    this.metaNode.childNodeBuilders.push(...xs)

    return this
  }
}


// Convenience functions

export const t = textContent =>
  new TextNodeBuilder(textContent)

export const e = (name, namespace) => (...variadic) => {
  const builder = new ElementBuilder(name, namespace)

  // Implement optional attributes as first argument
  if (variadic[0] && isAttributes(variadic[0]))
    [builder.metaNode.attributes, ...builder.metaNode.childNodeBuilders] = variadic
  else {
    builder.metaNode.attributes = {}
    builder.metaNode.childNodeBuilders = variadic
  }

  return builder
}
