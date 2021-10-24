import { LiveFragment } from "./live-fragment.mjs"
import { isReactive, reactiveDo } from "../reactive/index.mjs"

//#region Bruh child functions e.g. bruhChildrenToNodes()

// A basic check for if a value is allowed as a child in bruh
// It's responsible for quickly checking the type, not deep validation
const isBruhChild = x =>
  // Reactives and DOM nodes
  x?.[isReactive] ||
  x instanceof Node ||
  // Any array, just assume it contains valid children
  Array.isArray(x) ||
  // Allow nullish
  x == null ||
  // Disallow functions and objects
  !(typeof x === "function" || typeof x === "object")
  // Everything else can be a child when stringified

// Coerces input into a DOM node, if it isn't already one
const toNode = x =>
  x instanceof Node
    ? x
    : document.createTextNode(x)

// Processes bruh children into an array of DOM nodes
// Reactive values are automatically replaced, so the output must be placed into a parent node
// before any top level (after flattening arrays) reactions run
export const bruhChildrenToNodes = (...children) =>
  children
    .flat(Infinity)
    .flatMap(child => {
      // Non-reactive values are untouched
      if (!child[isReactive])
        return [toNode(child)]

      // Reactive arrays become live fragments with auto-swapped children
      if (Array.isArray(child.value)) {
        const liveFragment = new LiveFragment()
        child.addReaction(() => {
          liveFragment.replaceChildren(...bruhChildrenToNodes(...child.value))
        })
        return [liveFragment.startMarker, ...bruhChildrenToNodes(...child.value), liveFragment.endMarker]
      }

      // Reactive values become auto-swapped DOM nodes
      let node = toNode(child.value)
      child.addReaction(() => {
        const oldNode = node
        node = toNode(child.value)
        oldNode.replaceWith(node)
      })
      return [node]
    })

//#endregion

//#region Reactive-aware element helper functions e.g. applyAttributes()

// Style attribute rules from an object with
// potentially reactive and/or undefined values
export const applyStyles = (element, styles) => {
  for (const property in styles)
    reactiveDo(styles[property], value => {
      if (value !== undefined)
        element.style.setProperty   (property, value)
      else
        element.style.removeProperty(property)
    })
}

// Class list from an object mapping from
// class names to potentially reactive booleans
export const applyClasses = (element, classes) => {
  for (const name in classes)
    reactiveDo(classes[name], value => {
      element.classList.toggle(name, value)
    })
}

// Attributes from an object with
// potentially reactive and/or undefined values
export const applyAttributes = (element, attributes) => {
  for (const name in attributes)
    reactiveDo(attributes[name], value => {
      if (value !== undefined)
        element.setAttribute   (name, value)
      else
        element.removeAttribute(name)
    })
}

//#endregion

//#region t() for text nodes and e() for element nodes

// Text nodes
export const t = textContent => {
  // Non-reactive values are just text nodes
  if (!textContent[isReactive])
    return document.createTextNode(textContent)

  // Reactive values auto-update the node's text content
  const node = document.createTextNode(textContent.value)
  textContent.addReaction(() => {
    node.textContent = textContent.value
  })
  return node
}

// Elements
export const e = name => (...variadic) => {
  // If there are no props
  if (isBruhChild(variadic[0])) {
    const element = document.createElement(name)
    element.append(...bruhChildrenToNodes(...variadic))
    return element
  }

  // If props exist as the first variadic argument
  const [props, ...children] = variadic

  // Extract explicit options from the bruh prop
  const { namespace } = props.bruh ?? {}
  delete props.bruh

  // Make an element with optional namespace
  const element =
    namespace
      ? document.createElementNS(namespace, name)
      : document.createElement  (           name)

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
  element.append(...bruhChildrenToNodes(...children))
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



// Hydration of all bruh-textnode's from prerendered html
export const hydrateTextNodes = () => {
  const tagged = {}
  const bruhTextNodes = document.getElementsByTagName("bruh-textnode")

  for (const bruhTextNode of bruhTextNodes) {
    const textNode = document.createTextNode(bruhTextNode.textContent)

    const tag = bruhTextNode.getAttribute("tag")
    if (tag)
      tagged[tag] = textNode

    bruhTextNode.replaceWith(textNode)
  }

  return tagged
}
