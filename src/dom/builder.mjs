const toNode = xs =>
  xs.map(x =>
    x.isNodeBuilder
      ? x.node
      : x
  )

export const t = string => {
  const node = document.createTextNode(string)

  const builder = {
    isNodeBuilder: true,
    isTextNode: true,
    node,

    bruh: (f = () => {}) => {
      if (!node.bruh)
        node.bruh = {}

      Object.assign(node.bruh, f(node))

      return builder
    },

    properties: (properties = {}) => {
      Object.assign(node, properties)

      return builder
    }
  }

  return builder
}

export const e = (name, namespace) => (...xs) => {
  const node =
    namespace ? document.createElementNS(namespace, name)
              : document.createElement  (           name)

  node.append(...toNode(xs))

  const builder = {
    isNodeBuilder: true,
    isElement: true,
    node,

    bruh: (f = () => {}) => {
      if (!node.bruh)
        node.bruh = {}

      Object.assign(node.bruh, f(node))

      return builder
    },

    properties: (properties = {}) => {
      Object.assign(node, properties)

      return builder
    },

    attributes: (attributes = {}) => {
      Object.entries(attributes)
        .forEach(([name, value]) => node.setAttribute(name, value))

      return builder
    },

    data: (dataAttributes = {}) => {
      Object.assign(node.dataset, dataAttributes)

      return builder
    },

    prepend: (...xs) => {
      node.prepend(...toNode(xs))

      return builder
    },

    append: (...xs) => {
      node.append(...toNode(xs))

      return builder
    }
  }

  return builder
}
