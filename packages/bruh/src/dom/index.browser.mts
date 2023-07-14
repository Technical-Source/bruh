import { isReactive, reactiveDo } from "../reactive/index.mts"
import type { Reactive, MaybeReactive } from "../reactive/index.mts"
import type {
  PropertyWiseOr,
  LikelyAsString,
  LikelyAsAbsent,
  LikelyAsBoolean
} from "./types.mts"
import type { PropertiesHyphen as Styles } from "csstype"
import type {
  ElementType,

  HTMLTag,
  SVGTag,
  MathMLTag,

  Namespace,
  HTMLNamespace,
  SVGNamespace,
  MathMLNamespace,

  ElementToEventMap,
  ElementToAttributes
} from "html-info"

export type TerminalBruhChild =
  Node |
  LikelyAsString |
  LikelyAsAbsent

export type TerminalBruhChildOutputNode<Child extends TerminalBruhChild>
  = Child extends Node
    ? Child
  : Child extends LikelyAsString
    ? Text
  : Child extends LikelyAsAbsent
    ? Comment
  : Node

export type BruhChild =
  MaybeReactive<TerminalBruhChild> |
  Iterable<BruhChild>

export type StylesToApply = {
  [Property in keyof Styles]: MaybeReactive<Styles[Property] | LikelyAsAbsent>
}

export interface ClassesToApply {
  [className: string]: MaybeReactive<LikelyAsBoolean>
}

export type AttributesToApply<
  Name extends string,
  NS   extends Namespace = HTMLNamespace
> = {
  [Attribute in keyof ElementToAttributes<Name, NS>]?:
    MaybeReactive<ElementToAttributes<Name, NS>[Attribute] | LikelyAsBoolean>
}

type EventMapToListenerProps<EventMap> = {
  [E in ((keyof EventMap) & string) as `on${E}`]:
    (event: EventMap[E]) => void
}

type AttributeMapToProps<AttributeMap> = {
  [Attribute in keyof AttributeMap]:
    MaybeReactive<AttributeMap[Attribute] | LikelyAsBoolean>
    | ( Attribute extends "style"
        ? StylesToApply
      : Attribute extends "class"
        ? ClassesToApply
      : never
    )
}

export interface BruhOptions {
  namespace?: Namespace
}

interface BaseBruhProps {
  bruh?:  BruhOptions,
  children?: BruhChild
}

export type BruhProps<
  Name extends string,
  NS   extends string = HTMLNamespace
>
  = BaseBruhProps
  & (
    NS extends HTMLNamespace
      ? { bruh?: { namespace?:  HTMLNamespace } }
      : { bruh: { namespace: NS } }
  )
  & Partial<
    EventMapToListenerProps<ElementToEventMap<Name, NS>> &
    AttributeMapToProps<ElementToAttributes<Name, NS>>
  >

export type   HTMLTagToBruhProps = { [Name in   HTMLTag]: BruhProps<Name,   HTMLNamespace> }
export type    SVGTagToBruhProps = { [Name in    SVGTag]: BruhProps<Name,    SVGNamespace> }
export type MathMLTagToBruhProps = { [Name in MathMLTag]: BruhProps<Name, MathMLNamespace> }

export type TagToBruhProps =
  PropertyWiseOr<
    HTMLTagToBruhProps,
    PropertyWiseOr<
      SVGTagToBruhProps,
      MathMLTagToBruhProps
    >
  >

export namespace JSX {
  /** @see https://www.typescriptlang.org/docs/handbook/jsx.html#children-type-checking */
  export interface ElementChildrenAttribute { children: {} }

  /** @see https://www.typescriptlang.org/docs/handbook/jsx.html#attribute-type-checking */
  export interface IntrinsicElements extends TagToBruhProps {}

  export type Element = any

  export type ElementType = HTMLTag | SVGTag | MathMLTag | ((props: any) => Element)
}

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

type ElementWithStyle = HTMLElement | SVGElement | MathMLElement

// https://w3c.github.io/csswg-drafts/cssom/#the-elementcssinlinestyle-mixin
const isElementWithStyle = <T extends Element>(element: T): element is (T & ElementWithStyle)  =>
  // @ts-ignore
  element.style instanceof CSSStyleDeclaration

/**
 * Style attribute rules from an object with
 * potentially reactive and/or set as absent values
 */
export const applyStyles = <E extends ElementWithStyle>(
  element: E,
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
    reactiveDo<ElementToAttributes<Name, NS>[typeof name] | LikelyAsBoolean>(attributes[name], value => {
      if (typeof value === "boolean")
        element.toggleAttribute(name, value)
      else if (value != null)
        element.setAttribute   (name, value + "")
      else
        element.removeAttribute(name)
    })
}

//#endregion

//#region t()

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

//#endregion

//#region JSX integration

declare global {
  interface String {
    startsWith<Prefix extends string>(
      prefix: Prefix,
      position?: 0
    ): this is `${Prefix}${string}`
  }
}

export const jsx: {
  /**
   * Create an HTML element
   */
  <
    Name extends HTMLTag
  >(
    name: Name,
    props: HTMLTagToBruhProps[Name],
    key?: string
  ):
    HTMLElementTagNameMap[Name]

  /**
   * Create an SVG element
   */
  <
    Name extends SVGTag
  >(
    name: Name,
    props: SVGTagToBruhProps[Name],
    key?: string
  ):
    SVGElementTagNameMap[Name]

  /**
   * Create a MathML element
   */
  <
    Name extends MathMLTag
  >(
    name: Name,
    props: MathMLTagToBruhProps[Name],
    key?: string
  ):
    MathMLElementTagNameMap[Name]

  /**
   * Create an element
   */
  <
    Name extends string,
    NS   extends Namespace = HTMLNamespace
  >(
    name: Name,
    props: BruhProps<Name, NS>,
    key?: string
  ):
    ElementType<Name, NS>

  /**
   * Call a function as a JSX component
   */
  <
    Props extends Record<any, unknown>,
    Result
  >(
    component: (props: Props) => Result,
    props: Props,
    key?: string
  ): Result
} =
<
  Name extends string,
  NS   extends Namespace = HTMLNamespace
>
(
  nameOrComponent: Name | Function,
  props_: Record<any, unknown>,
  key?: string
) => {
  if (key !== undefined)
    props_.key = key

  // It must be a component, as bruh components are just functions
  // Due to JSX, this would mean a function with only one parameter - props
  // This object includes all of the normal props and a "children" key
  if (typeof nameOrComponent !== "string") {
    const component = nameOrComponent
    const props = props_ as Record<any, unknown>

    return component(props)
  }

  const name = nameOrComponent
  const props = props_ as BruhProps<Name, NS>

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

  if ('children' in props) {
    element.append(
      ...bruhChildrenToNodes(
        Array.isArray(props.children)
          ? props.children
          : [props.children]
      )
    )

    delete props.children
  }

  // Apply overloaded props, if possible

  // Inline style object
  if (
    "style" in props &&
    props.style != null &&
    typeof props.style === "object" &&
    !isReactive(props.style) &&
    isElementWithStyle(element)
  ) {
    applyStyles(element, props.style)
    delete props.style
  }

  // Classes object
  if (
    "class" in props &&
    props.class != null &&
    typeof props.class === "object" &&
    !isReactive(props.class)
  ) {
    applyClasses(element, props.class)
    delete props.class
  }

  for (const name_ in props) {
    const name = name_ as string & (keyof typeof props)
    // Event listener functions
    if (typeof props[name] === "function" && name.startsWith("on")) {
      element.addEventListener(name.slice(2), props[name] as any)
      delete props[name]
    }
  }

  // The rest of the props are attributes
  applyAttributes(element, props as AttributesToApply<Name, NS>)

  return element
}

export const Fragment =
  <Children extends BruhChild>
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
