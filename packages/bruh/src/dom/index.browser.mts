import { isReactive, reactiveDo } from "../reactive/index.mjs"
import type { Reactive, MaybeReactive } from "../reactive/index.mjs"
import type {
  ElementType,
  LikelyAsString,
  LikelyAsAbsent,
  StylesToApply,
  ClassesToApply,
  AttributesToApply,
  BruhOptions,
  Namespace,
  HTMLNamespace,
  BruhProps
} from "./shared.mjs"

type TerminalBruhChild =
  Node |
  LikelyAsString |
  LikelyAsAbsent

type TerminalBruhChildOutputNode<Child extends TerminalBruhChild>
  = Child extends Node
    ? Child
  : Child extends LikelyAsString
    ? Text
  : Child extends LikelyAsAbsent
    ? Comment
  : Node

// Note that typescript only lets definition recursion occur within the Array<...>

type FlatBruhChild =
  MaybeReactive<TerminalBruhChild> |
  Reactive<ReadonlyArray<BruhChild>>

type BruhChild =
  FlatBruhChild |
  ReadonlyArray<BruhChild>

// Coerces input into a DOM node, if it isn't already one
const terminalBruhChildToNode: {
  <Child extends TerminalBruhChild>(child: Child): TerminalBruhChildOutputNode<Child>
} = (child: TerminalBruhChild): any => {
  // Existing DOM nodes are untouched
  if (child instanceof Node)
    return child
  // Nullish and booleans are ignored
  else if (child == null || typeof child === "boolean")
    return document.createComment(child + "")
  // Anything else is treated as text
  else
    return document.createTextNode(child + "")
}

// Auto-swapping single reactive node
const reactiveTerminalBruhChildToNode: {
  <Child extends TerminalBruhChild>(child: Reactive<Child>): TerminalBruhChildOutputNode<Child>
} = (child: Reactive<TerminalBruhChild>): any => {
  let node = terminalBruhChildToNode(child.value)

  const stopReacting = child.addReaction(() => {
    // Stop swapping if no longer possible
    if (!node.parentNode) {
      stopReacting()
      return
    }

    const oldNode = node as typeof node & ChildNode
    const child_ = child as Reactive<TerminalBruhChild | ReadonlyArray<TerminalBruhChild>>

    // Normal swap
    if (!Array.isArray(child_.value)) {
      node = terminalBruhChildToNode(child_.value as TerminalBruhChild)
      oldNode.replaceWith(node)
    }
    // If an array now, stop swapping, then switch to reactive array swapping
    else {
      stopReacting()
      oldNode.replaceWith(...reactiveArrayBruhChildToNodes(child_ as Reactive<ReadonlyArray<TerminalBruhChild>>))
    }
  })

  return node
}

// Auto-swapping reactive array of nodes
const reactiveArrayBruhChildToNodes: {
  (child: Reactive<ReadonlyArray<BruhChild>>): [Comment, ...ReadonlyArray<Node>, Comment]
} = (child: Reactive<ReadonlyArray<BruhChild>>) => {
  // Markers owned by the swapper here itself, so that
  // the values in the array can be swapped separately
  const first = document.createComment("[")
  const last  = document.createComment("]")

  const stopReacting = child.addReaction(() => {
    // Stop swapping if there is no parent to swap within
    if (!first.parentNode) {
      stopReacting()
      return
    }

    // Make a range starting after the first marker
    const range = document.createRange()
    range.setStartAfter(first)

    // Normal swap, replacing content between the first and last markers
    if (Array.isArray(child.value)) {
      const child_ = child as Reactive<ReadonlyArray<TerminalBruhChild>>

      range.setEndBefore(last)
      range.deleteContents()
      first.after(...bruhChildrenToNodes(child_.value))
    }
    // Switch to single swapping node by replacing everything
    else {
      const child_ = child as unknown as Reactive<TerminalBruhChild>

      stopReacting()
      range.setEndAfter(last)
      range.deleteContents()
      first.replaceWith(reactiveTerminalBruhChildToNode(child_))
    }
  })

  return [
    first,
    ...bruhChildrenToNodes(child.value),
    last
  ]
}

// Processes bruh children into an array of DOM nodes
// Reactive values are automatically replaced, so the output must be placed into a parent node
// before any top level (after flattening arrays) reactions run
export const bruhChildrenToNodes = (children: ReadonlyArray<BruhChild>) => {
  // @ts-ignore
  const flattened = children.flat(Infinity) as ReadonlyArray<FlatBruhChild>
  return flattened.flatMap(child => {
    // Non-reactive child
    if (!isReactive(child))
      return [terminalBruhChildToNode(child)]

    // Single reactive value
    if (!Array.isArray(child.value))
      return [reactiveTerminalBruhChildToNode(child as Reactive<TerminalBruhChild>)]

    // Reactive array
    return reactiveArrayBruhChildToNodes(child as Reactive<ReadonlyArray<BruhChild>>)
  })
}

//#endregion

//#region Reactive-aware element helper functions e.g. applyAttributes()

type ElementWithStyle<T extends Element> =
  T extends { style: CSSStyleDeclaration }
    ? T
    : never

// https://w3c.github.io/csswg-drafts/cssom/#the-elementcssinlinestyle-mixin
const isElementWithStyle = <T extends Element>(element: T): element is ElementWithStyle<T> =>
  // @ts-ignore
  element.style instanceof CSSStyleDeclaration

/**
 * Style attribute rules from an object with
 * potentially reactive and/or set as absent values
 */
export const applyStyles = <E extends Element>(
  element: ElementWithStyle<E>,
  styles:  StylesToApply
) => {
  for (const property in styles) {
    const property_ = property as keyof StylesToApply
    reactiveDo(styles[property_], value => {
      if (value != null && typeof value !== "boolean")
        element.style.setProperty   (property, value + "")
      else
        element.style.removeProperty(property)
    })
  }
}

/**
 * Class list from an object mapping from
 * class names to potentially reactive booleans
 */
export const applyClasses = (
  element: Element,
  classes: ClassesToApply
) => {
  for (const name in classes)
    reactiveDo(classes[name], value => {
      // without coercing to a boolean, `undefined` would toggle instead of forcing removal
      element.classList.toggle(name, value === true)
    })
}

/**
 * Attributes from an object with
 * potentially reactive and/or set as absent values
 */
export const applyAttributes = <
  Name extends string,
  NS   extends Namespace = HTMLNamespace
>(
  element:    ElementType<Name, NS>,
  attributes: AttributesToApply<Name, NS>
) => {
  for (const name in attributes)
    reactiveDo(attributes[name] as any, value => {
      if (value != null && typeof value !== "boolean")
        element.setAttribute   (name, value + "")
      else
        element.removeAttribute(name)
    })
}

//#endregion

//#region t() for text nodes and h() for element nodes

// Text nodes
export const t = (textContent: MaybeReactive<LikelyAsString>) => {
  // Non-reactive values are just text nodes
  if (!isReactive(textContent))
    return document.createTextNode(textContent + "")

  // Reactive values auto-update the node's text content
  const node = document.createTextNode(textContent.value + "")
  textContent.addReaction(() => {
    node.textContent = textContent.value + ""
  })
  return node
}

declare global {
  interface String {
    startsWith<Prefix extends string>(
      prefix: Prefix,
      position?: 0
    ): this is `${Prefix}${string}`
  }
}

/**
 * Classic JSX createElement
 */
export const h: {
  /**
   * Create an element
   */
  <
    Name extends string,
    NS   extends Namespace = HTMLNamespace
  >(
    name: Name,
    props?: BruhProps<Name, NS> | null,
    ...children: ReadonlyArray<BruhChild>
  ):
    ElementType<Name, NS>

  /**
   * Call a function as a JSX component
   */
  <
    Props    extends Record<any, unknown>,
    Children extends ReadonlyArray<unknown>,
    Result
  >(
    component: (props: Props & { children: Children }) => Result,
    props?: Props | null,
    ...children: Children
  ): Result
} =
<
  Name extends string,
  NS   extends Namespace = HTMLNamespace
>
(
  nameOrComponent: string | Function,
  props_?: Record<any, unknown> | null,
  ...children_: ReadonlyArray<unknown>
) => {
  // It must be a component, as bruh components are just functions
  // Due to JSX, this would mean a function with only one parameter - props
  // This object includes all of the normal props and a "children" key
  if (typeof nameOrComponent !== "string") {
    const component = nameOrComponent
    const props = props_ as Record<any, unknown> | null | undefined
    const children = children_ as ReadonlyArray<unknown>

    return component({
      ...props,
      children
    })
  }

  const name = nameOrComponent
  const props = props_ as BruhProps<typeof name, NS> | null | undefined
  const children = children_ as ReadonlyArray<BruhChild>

  if (!props) {
    const element = document.createElement(name) as ElementType<Name, NS>
    if (children.length)
      element.append(...bruhChildrenToNodes(children))
    return element
  }

  // Extract explicit options from the bruh prop
  let options: BruhOptions = {}
  if (typeof props.bruh === "object" && !isReactive(props.bruh)) {
    options = props.bruh
    delete props.bruh
  }
  const { namespace } = options

  // Make an element with optional namespace
  const element =
    namespace
      ? document.createElementNS(namespace, name) as ElementType<Name, NS>
      : document.createElement  (           name) as ElementType<Name, NS>

  // Apply overloaded props, if possible

  // Inline style object
  if (typeof props.style === "object" && !isReactive(props.style) && isElementWithStyle(element)) {
    applyStyles(element, props.style)
    delete props.style
  }
  // Classes object
  if (typeof props.class === "object" && !isReactive(props.class)) {
    applyClasses(element, props.class)
    delete props.class
  }
  for (const name in props) {
    // Event listener functions
    if (typeof props[name] === "function" && name.startsWith("on")) {
      element.addEventListener(name.slice(2), props[name] as any)
      delete props[name]
    }
  }

  // The rest of the props are attributes
  applyAttributes(element as ElementType<Name, NS>, props as AttributesToApply<Name, NS>)

  if (children.length)
    element.append(...bruhChildrenToNodes(children))
  return element
}

/**
 * The JSX fragment is made into a bruh fragment (just an array)
 */
export const JSXFragment =
  <const Children extends ReadonlyArray<unknown>>
  (props: { children: Children }) => props.children

//#endregion


// Hydration of all bruh-textnode's from prerendered html
export const hydrateTextNodes = () => {
  const tagged: { [tag: string]: Text } = {}
  const bruhTextNodes = document.getElementsByTagName("bruh-textnode")

  for (const bruhTextNode of bruhTextNodes) {
    const textNode = document.createTextNode(bruhTextNode.textContent!)

    const tag = bruhTextNode.getAttribute("tag")
    if (tag)
      tagged[tag] = textNode

    bruhTextNode.replaceWith(textNode)
  }

  return tagged
}
