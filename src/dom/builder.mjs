export const t = string => document.createTextNode(string)

const autoToElement = xs =>
  xs.map(x =>
    x.isBuilder
      ? x.element
      : x
  )

export const h = (name, namespace) => {
  const element =
    namespace ? document.createElementNS(namespace, name)
              : document.createElement  (           name)

  const builder = {
    isBuilder: true,

    element,

    bruh: properties => {
      element.bruh = {}
      Object.assign(element.bruh, properties)

      return builder
    },

    attributes: attributes => {
      Object.entries(attributes)
        .forEach(([name, value]) => element.setAttribute(name, value))

      return builder
    },

    before: (...xs) => {
      element.before(...autoToElement(xs))

      return builder
    },

    prepend: (...xs) => {
      element.prepend(...autoToElement(xs))

      return builder
    },

    append: (...xs) => {
      element.append(...autoToElement(xs))

      return builder
    },

    after: (...xs) => {
      element.after(...autoToElement(xs))

      return builder
    }
  }

  return builder
}
