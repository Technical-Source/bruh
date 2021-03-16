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


export const t = textContent => {
  const meta = {
    textContent,
    bruhFunction: () => {},
    properties: {}
  }

  const builder = {
    isNodeBuilder: true,
    hasMetaTextNode: true,
    meta,

    toString: () =>
      `<bruh-textnode style="all:unset;display:inline">${escapeForElement(meta.textContent.toString())}</bruh-textnode>`,

    toNode: () => {
      const node = document.createTextNode(meta.textContent)

      node.bruh = meta.bruhFunction(node)
      Object.assign(node, meta.properties)

      return node
    },

    bruh: (f = () => {}) => {
      meta.bruhFunction = f

      return builder
    },

    properties: (properties = {}) => {
      Object.assign(meta.properties, properties)

      return builder
    }
  }

  return builder
}

// childNodeBuilders may contain strings
export const e = (name, namespace) => (...childNodeBuilders) => {
  const meta = {
    name,
    namespace,
    childNodeBuilders,
    bruhFunction: () => {},
    properties: {},
    attributes: {},
    dataset: {}
  }

  const builder = {
    isNodeBuilder: true,
    hasMetaElement: true,
    meta,

    toString: () => {
      // https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
      const attributes =
        [
          ...Object.entries(meta.attributes),
          ...Object.entries(meta.dataset)
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
      const startTag = `<${meta.name}${attributes}>`

      if (isVoidElement(meta.name))
        return startTag
      else {
        const contents =
          meta.childNodeBuilders
            .map(cnb =>
              typeof cnb == "string"
                ? escapeForElement(cnb)
                : cnb.toString()
            ).join("")
        // https://html.spec.whatwg.org/multipage/syntax.html#end-tags
        const endTag = `</${meta.name}>`
        return startTag + contents + endTag
      }
    },

    toNode: () => {
      const node =
        namespace ? document.createElementNS(meta.namespace, meta.name)
                  : document.createElement(meta.name)

      // Add children
      node.append(...meta.childNodeBuilders
        .map(cnb =>
          cnb.isNodeBuilder
            ? cnb.toNode()
            : cnb // Allow strings to become bare text nodes
        )
      )
      // Assign node.bruh, other properties, attributes, and dataset
      node.bruh = meta.bruhFunction(node)
      Object.assign(node, meta.properties)
      Object.entries(meta.attributes)
        .forEach(([name, value]) => node.setAttribute(name, value))
      Object.assign(node.dataset, meta.dataset)

      return node
    },

    bruh: (f = () => {}) => {
      meta.bruhFunction = f

      return builder
    },

    properties: (properties = {}) => {
      Object.assign(meta.properties, properties)

      return builder
    },

    attributes: (attributes = {}) => {
      Object.assign(meta.attributes, attributes)

      return builder
    },

    data: (dataAttributes = {}) => {
      Object.assign(meta.dataset, dataAttributes)

      return builder
    },

    prepend: (...xs) => {
      meta.childNodeBuilders.unshift(...xs)

      return builder
    },

    append: (...xs) => {
      meta.childNodeBuilders.push(...xs)

      return builder
    }
  }

  return builder
}
