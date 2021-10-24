const isMetaNode      = Symbol.for("bruh meta node")
const isMetaTextNode  = Symbol.for("bruh meta text node")
const isMetaElement   = Symbol.for("bruh meta element")
const isMetaRawString = Symbol.for("bruh meta raw string")

//#region HTML syntax functions

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
const attributesToString = attributes =>
  Object.entries(attributes)
    .map(([name, value]) =>
      value === ""
        ? ` ${name}`
        : ` ${name}="${escapeForDoubleQuotedAttribute(value)}"`
    ).join("")

//#endregion

// A basic check for if a value is allowed as a meta node's child
// It's responsible for quickly checking the type, not deep validation
const isMetaChild = x =>
  // meta nodes, reactives, and DOM nodes
  x?.[isMetaNode] ||
  x?.[isMetaRawString] ||
  // Any array, just assume it contains valid children
  Array.isArray(x) ||
  // Allow nullish
  x == null ||
  // Disallow functions and objects
  !(typeof x === "function" || typeof x === "object")
  // Everything else can be a child when stringified


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

  toString() {
    const tag = this.tag
      ? ` tag="${escapeForDoubleQuotedAttribute(this.tag)}"`
      : ""
    return `<bruh-textnode style="all:unset;display:inline"${tag}>${
      escapeForElement(this.textContent)
    }</bruh-textnode>`
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

  toString() {
    const attributes = attributesToString(this.attributes)
    // https://html.spec.whatwg.org/multipage/syntax.html#syntax-start-tag
    const startTag = `<${this.name}${attributes}>`
    if (isVoidElement(this.name))
      return startTag

    const contents = this.children
      .flat(Infinity)
      .map(child =>
        (child[isMetaNode] || child[isMetaRawString])
          ? child.toString()
          : escapeForElement(child)
      )
      .join("")
    // https://html.spec.whatwg.org/multipage/syntax.html#end-tags
    const endTag = `</${this.name}>`
    return startTag + contents + endTag
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
      if (value !== undefined)
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
