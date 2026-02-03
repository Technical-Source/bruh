import { reactiveDo, flat, watch } from "../reactive/index.mts"
import { Reactive, type MaybeReactive, type NestedReactive } from "../reactive/index.mts"
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
  | Node
  | LikelyAsString
  | LikelyAsAbsent

export type TerminalBruhChildOutputNode<Child extends TerminalBruhChild>
  = Child extends Node
    ? Child
  : Child extends LikelyAsString
    ? Text
  : Child extends LikelyAsAbsent
    ? Comment
  : Node

export type BruhChild =
  | MaybeReactive<TerminalBruhChild>
  | Iterable<BruhChild>
  | NestedReactive<TerminalBruhChild | Iterable<BruhChild>>

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

const isBruhIterable = (x: unknown): x is Iterable<BruhChild> =>
  x != null &&
  typeof x === "object" &&
  !(x instanceof Node) &&
  Symbol.iterator in x

export const ownedReactivesSymbol = Symbol.for("bruh owned reactives")

declare global {
  interface Node {
    [ownedReactivesSymbol]?: Set<Reactive<unknown>>
  }
}

// Auto-swapping single reactive node
const reactiveTerminalBruhChildToNode: {
  <Child extends TerminalBruhChild>(child: Reactive<Child>): TerminalBruhChildOutputNode<Child>
} = (child: Reactive<TerminalBruhChild>): any => {
  const node = terminalBruhChildToNode(child.peek())

  let ownedReactives = node[ownedReactivesSymbol] ??= new Set()
  ownedReactives.add(child)

  let nodeWeakRef = new WeakRef(node)

  const stopReacting = watch([child], () => {
    const node = nodeWeakRef.deref()

    // Stop swapping if no longer possible
    if (!node) {
      stopReacting()
      return
    }
    if (!node.parentNode) {
      console.warn("Node has no parent to swap within", { node, child })
      return
    }

    const oldNode = node as typeof node & ChildNode
    const child_ = child as Reactive<BruhChild>

    ownedReactives.delete(child)

    // If an iterable now, stop swapping, then switch to reactive iterable swapping
    if (isBruhIterable(child.value)) {
      stopReacting()
      const nodes = reactiveIterableBruhChildToNodes(child_ as Reactive<Iterable<BruhChild>>)
      oldNode.replaceWith(...nodes)
    }
    // Normal swap
    else {
      const node = terminalBruhChildToNode(child.value)
      ownedReactives = node[ownedReactivesSymbol] ??= new Set()
      ownedReactives.add(child)
      nodeWeakRef = new WeakRef(node)
      oldNode.replaceWith(node)
    }
  }, { skipFirst: true })

  return node
}

// Auto-swapping reactive iterable of nodes
function * reactiveIterableBruhChildToNodes(child: Reactive<Iterable<BruhChild>>): IterableIterator<Node> {
  // Markers owned by the swapper here itself, so that
  // the values in the iterable can be swapped separately
  const first = document.createComment("[")
  const last  = document.createComment("]")

  let ownedReactives = first[ownedReactivesSymbol] ??= new Set()
  ownedReactives.add(child)

  let firstWeakRef = new WeakRef(first)
  let lastWeakRef  = new WeakRef(last)

  const stopReacting = watch([child], () => {
    const first = firstWeakRef.deref()
    const last  = lastWeakRef.deref()

    // Stop swapping if there is no parent to swap within
    if (!first || !last) {
      stopReacting()
      return
    }
    if (!first.parentNode || !last.parentNode) {
      console.warn("Node range has no parent to swap within", { first, last, child })
      return
    }

    const child_ = child as Reactive<BruhChild>

    // Make a range starting after the first marker
    const range = document.createRange()
    range.setStartAfter(first)

    // Normal swap, replacing content between the first and last markers
    if (isBruhIterable(child.value)) {
      range.setEndBefore(last)
      range.deleteContents()
      first.after(...bruhChildrenToNodes(child.value))
    }
    // Switch to single swapping node by replacing everything
    else {
      ownedReactives.delete(child)

      stopReacting()
      range.setEndAfter(last)
      range.deleteContents()
      first.replaceWith(reactiveTerminalBruhChildToNode(child_ as Reactive<TerminalBruhChild>))
    }
  }, { skipFirst: true })

  yield first
  yield* bruhChildrenToNodes(child.peek())
  yield last
}

// Processes bruh children into an iterable of DOM nodes
// Reactive values are automatically replaced, so the output must be placed into a parent node
// before any top level (after flattening iterables) reactions run
export function * bruhChildrenToNodes(children: Iterable<BruhChild>): IterableIterator<Node> {
  const partiallyFlattened =
    Array.isArray(children)
      ? children.flat<BruhChild, number>(Infinity)
      : children

  for (const child of partiallyFlattened) {
    if (!(child instanceof Reactive)) {
      if (isBruhIterable(child))
        yield* bruhChildrenToNodes(child)
      else
        yield terminalBruhChildToNode(child)
    }
    else {
      const flattened = flat(child as NestedReactive<Iterable<BruhChild> | TerminalBruhChild>)

      if (isBruhIterable(flattened.peek()))
        yield* reactiveIterableBruhChildToNodes(flattened as Reactive<Iterable<BruhChild>>)
      else
        yield reactiveTerminalBruhChildToNode(flattened as Reactive<TerminalBruhChild>)
    }
  }
}

//#endregion

//#region Reactive-aware element helper functions e.g. applyAttributes()

type ElementWithStyle = HTMLElement | SVGElement | MathMLElement

// https://w3c.github.io/csswg-drafts/cssom/#the-elementcssinlinestyle-mixin
const isElementWithStyle = <T extends Element>(element: T): element is (T & ElementWithStyle) =>
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
  const ownedReactives = element[ownedReactivesSymbol] ??= new Set()
  let elementWeakRef = new WeakRef(element)

  for (const property in styles) {
    const property_ = property as keyof StylesToApply
    const maybeReactive = styles[property_]
    if (maybeReactive instanceof Reactive)
      ownedReactives.add(maybeReactive)

    const stopReacting = reactiveDo(maybeReactive, value => {
      const element = elementWeakRef.deref()
      if (!element) {
        stopReacting?.()
        return
      }

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
  const ownedReactives = element[ownedReactivesSymbol] ??= new Set()
  let elementWeakRef = new WeakRef(element)

  for (const name in classes) {
    const maybeReactive = classes[name]
    if (maybeReactive instanceof Reactive)
      ownedReactives.add(maybeReactive)

    const stopReacting = reactiveDo(maybeReactive, value => {
      const element = elementWeakRef.deref()
      if (!element) {
        stopReacting?.()
        return
      }

      // without coercing to a boolean, `undefined` would toggle instead of forcing removal
      element.classList.toggle(name, value === true)
    })
  }
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
  const ownedReactives = element[ownedReactivesSymbol] ??= new Set()
  let elementWeakRef = new WeakRef(element)

  for (const name in attributes) {
    const maybeReactive = attributes[name]
    if (maybeReactive instanceof Reactive)
      ownedReactives.add(maybeReactive)

    const stopReacting = reactiveDo<ElementToAttributes<Name, NS>[typeof name] | LikelyAsBoolean>(attributes[name], value => {
      const element = elementWeakRef.deref()
      if (!element) {
        stopReacting?.()
        return
      }

      if (typeof value === "boolean")
        element.toggleAttribute(name, value)
      else if (value != null)
        element.setAttribute   (name, value + "")
      else
        element.removeAttribute(name)
    })
  }
}

//#endregion

//#region t()

// Text nodes
export const t = (textContent: MaybeReactive<LikelyAsString>) => {
  // Non-reactive values are just text nodes
  if (!(textContent instanceof Reactive))
    return document.createTextNode(textContent + "")

  // Reactive values auto-update the node's text content
  const node = document.createTextNode(textContent.peek() + "")
  const ownedReactives = node[ownedReactivesSymbol] ??= new Set()
  ownedReactives.add(textContent)
  let nodeWeakRef = new WeakRef(node)

  const stopReacting = watch([textContent], () => {
    const node = nodeWeakRef.deref()
    if (!node) {
      stopReacting()
      return
    }

    node.textContent = textContent.value + ""
  }, { skipFirst: true })
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
  if (typeof props.bruh === "object" && !(props.bruh instanceof Reactive)) {
    options = props.bruh
    delete props.bruh
  }
  const { namespace } = options

  // Make an element with optional namespace
  const element =
    namespace
      ? document.createElementNS(namespace, name) as ElementType<Name, NS>
      : document.createElement  (           name) as ElementType<Name, NS>

  if ("children" in props) {
    element.append(
      ...bruhChildrenToNodes(
        isBruhIterable(props.children)
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
    !(props.style instanceof Reactive) &&
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
    !(props.class instanceof Reactive)
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


export class BruhText extends HTMLElement {
  static hydrated: { readonly [tag: string]: ReadonlySet<Text> } = {}

  constructor() {
    super()

    const textNode = document.createTextNode(this.textContent!)

    const tag = this.getAttribute("tag")
    if (tag) {
      const set = (BruhText.hydrated as { [tag: string]: Set<Text> })[tag] ??= new Set()
      set.add(textNode)
    }

    this.replaceWith(textNode)
  }
}

customElements.define("bruh-text", BruhText)

declare global {
  interface HTMLElementTagNameMap {
    "bruh-text": BruhText
  }
}
declare module "html-info" {
  interface HTMLTagToAttributes {
    "bruh-text": {
      "tag"?: string
    }
  }
}
