import type {
  PropertyWiseOr,
  MaybePromise,
  LikelyAsString,
  LikelyAsAbsent,
  LikelyAsBoolean
} from "./types.mts"
import type { PropertiesHyphen as Styles } from "csstype"
import type {
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
import { makePromiseQueue } from "../utils/index.mts"

export type TerminalBruhChild =
  | LikelyAsString
  | LikelyAsAbsent
  | MetaNode
  | MetaRawString

export type BruhChild =
  | MaybePromise<TerminalBruhChild>
  | Iterable<BruhChild>
  | AsyncIterable<BruhChild>

export type StylesToApply = {
  [Property in keyof Styles]: MaybePromise<Styles[Property] | LikelyAsAbsent>
}

export interface ClassesToApply {
  [className: string]: MaybePromise<LikelyAsBoolean>
}

export type AttributesToApply<
  Name extends string,
  NS   extends Namespace = HTMLNamespace
> = {
  [Attribute in keyof ElementToAttributes<Name, NS>]?:
    MaybePromise<ElementToAttributes<Name, NS>[Attribute] | LikelyAsBoolean>
}

type EventMapToListenerProps<EventMap> = {
  [E in ((keyof EventMap) & string) as `on${E}`]:
    string
}

type AttributeMapToProps<AttributeMap> = {
  [Attribute in keyof AttributeMap]:
    MaybePromise<AttributeMap[Attribute] | LikelyAsBoolean>
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

  export type ElementType = HTMLTag | SVGTag | MathMLTag | ((props: any) => Element)}

const isMetaNode      = Symbol.for("bruh meta node")
const isMetaTextNode  = Symbol.for("bruh meta text node")
const isMetaElement   = Symbol.for("bruh meta element")
const isMetaRawString = Symbol.for("bruh meta raw string")

//#region HTML syntax functions

// https://html.spec.whatwg.org/multipage/syntax.html#void-elements
const voidElements = new Set([
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
] as const)

const isVoidElement = (element: string) =>
  voidElements.has(element as any)

// https://html.spec.whatwg.org/multipage/syntax.html#elements-2
// https://html.spec.whatwg.org/multipage/syntax.html#cdata-rcdata-restrictions
// Does not work for https://html.spec.whatwg.org/multipage/syntax.html#raw-text-elements (script and style)
const escapeForElement = (x: LikelyAsString) =>
  (x + "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")

// https://html.spec.whatwg.org/multipage/syntax.html#syntax-attribute-value
const escapeForDoubleQuotedAttribute = (x: LikelyAsString) =>
  (x + "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")

type Attributes = Partial<Record<string, MaybePromise<LikelyAsString | LikelyAsBoolean>>>

// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
function * attributesToIterator(attributes: Attributes): IterableIterator<string> {
  for (const name in attributes) {
    const value = attributes[name]

    if (
      value == null
      || value === false
      || value instanceof Promise
    )
      continue

    yield ` ${name}`

    if (value === true || value === "")
      continue

    yield `="${escapeForDoubleQuotedAttribute(value)}"`
  }
}

// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
async function * attributesToAsyncIterator(attributes: Attributes): AsyncIterableIterator<string> {
  for (const name in attributes) {
    try {
      const value = await attributes[name]

      if (value == null || value === false)
        continue

      yield ` ${name}`

      if (value === true || value === "")
        continue

      yield `="${escapeForDoubleQuotedAttribute(value)}"`
    }
    catch (e) {
      console.error(e)
      continue
    }
  }
}

//#endregion

//#region Meta Nodes that act like lightweight rendering-oriented DOM nodes

type MetaNode =
  | MetaTextNode
  | MetaElement<string, Namespace>

// Text nodes have no individual HTML representation
// We emulate this with a custom element <bruh-textnode> with an inline style reset
// These elements can be hydrated very quickly and even be marked with a tag
export class MetaTextNode {
  [isMetaNode]     = true;
  [isMetaTextNode] = true

  textContent: MaybePromise<LikelyAsString>
  tag?: string

  constructor(textContent: MaybePromise<LikelyAsString>) {
    this.textContent = textContent
  }

  * [Symbol.iterator](): IterableIterator<string> {
    yield `<bruh-textnode style="all:unset;display:inline"`
    if (this.tag)
      yield* attributesToIterator({ tag: this.tag })
    yield ">"

    if (!(this.textContent instanceof Promise))
      yield escapeForElement(this.textContent)

    yield "</bruh-textnode>"
  }

  async * [Symbol.asyncIterator](): AsyncIterableIterator<string> {
    yield `<bruh-textnode style="all:unset;display:inline"`
    if (this.tag)
      yield* attributesToAsyncIterator({ tag: this.tag })
    yield ">"

    try {
      yield escapeForElement(await this.textContent)
    }
    catch (e) {
      console.error(e)
    }

    yield "</bruh-textnode>"
  }

  toString(): string {
    let result = ""
    for (const chunk of this)
      result += chunk
    return result
  }

  async toStringPromise(): Promise<string> {
    let result = ""
    for await (const chunk of this)
      result += chunk
    return result
  }

  setTag(tag: string) {
    this.tag = tag

    return this
  }
}

// A light model of an element
export class MetaElement<
  Name extends string,
  NS   extends Namespace = HTMLNamespace
> {
  [isMetaNode]    = true;
  [isMetaElement] = true

  name: Name
  attributes: AttributesToApply<Name, NS> = {}
  children: Array<BruhChild> = []

  constructor(name: Name) {
    this.name = name
  }

  * #childChunks(children: Iterable<BruhChild>): IterableIterator<string> {
    const partiallyFlattened =
      Array.isArray(children)
        ? children.flat<BruhChild, number>(Infinity)
        : children

    for (const child of partiallyFlattened) {
      if (
        child == null
        || typeof child === "boolean"
        || child instanceof Promise
      )
        continue
      if (typeof child === "object" && isMetaNode in child)
        yield* child
      else if (typeof child === "object" && isMetaRawString in child)
        yield child as any as string
      else if (typeof child === "object" && Symbol.iterator in child)
        yield* this.#childChunks(child)
      else if (typeof child === "object" && Symbol.asyncIterator in child)
        continue
      else
        yield escapeForElement(child)
    }
  }

  async * #asyncChildChunks(children: Iterable<BruhChild> | AsyncIterable<BruhChild>): AsyncIterableIterator<string> {
    const partiallyFlattened =
      Array.isArray(children)
        ? children.flat<BruhChild, number>(Infinity)
        : children

    for await (const child of partiallyFlattened) {
      if (child == null || typeof child === "boolean")
        continue
      if (typeof child === "object" && isMetaNode in child)
        yield* child
      else if (typeof child === "object" && isMetaRawString in child)
        yield child as any as string
      else if (typeof child === "object" && (Symbol.iterator in child || Symbol.asyncIterator in child))
        yield* this.#asyncChildChunks(child)
      else
        yield escapeForElement(child)
    }
  }

  * [Symbol.iterator](): IterableIterator<string> {
    // https://html.spec.whatwg.org/multipage/syntax.html#syntax-start-tag
    yield `<${this.name}`
    yield* attributesToIterator(this.attributes as Attributes)
    yield ">"
    if (isVoidElement(this.name))
      return

    yield* this.#childChunks(this.children)

    // https://html.spec.whatwg.org/multipage/syntax.html#end-tags
    yield `</${this.name}>`
  }

  async * [Symbol.asyncIterator](): AsyncIterableIterator<string> {
    // https://html.spec.whatwg.org/multipage/syntax.html#syntax-start-tag
    yield `<${this.name}`
    yield* attributesToAsyncIterator(this.attributes as Attributes)
    yield ">"
    if (isVoidElement(this.name))
      return

    yield* this.#asyncChildChunks(this.children)

    // https://html.spec.whatwg.org/multipage/syntax.html#end-tags
    yield `</${this.name}>`
  }

  toString(): string {
    let result = ""
    for (const chunk of this)
      result += chunk
    return result
  }

  async toStringPromise(): Promise<string> {
    let result = ""
    for await (const chunk of this)
      result += chunk
    return result
  }
}

// Raw strings can be meta element children, where they bypass string escaping
// This should be avoided in general, but is needed for unsupported HTML features
export class MetaRawString extends String {
  [isMetaRawString] = true

  constructor(string: LikelyAsString) {
    super(string)
  }
}

//#endregion

//#region Meta element helper functions e.g. applyAttributes()

// Merge style rules with an object
export const applyStyles = (
  element: MetaElement<string, HTMLNamespace | SVGNamespace>,
  styles:  StylesToApply
) => {
  // TODO handle promises

  // Doesn't support proper escaping
  // https://www.w3.org/TR/css-syntax-3/#ref-for-parse-a-list-of-declarations%E2%91%A0
  // https://www.w3.org/TR/css-syntax-3/#typedef-ident-token
  const currentStyles =
    typeof element.attributes.style === "string"
      ? Object.fromEntries(
        element.attributes.style
          .split(";").filter(s => s.length)
          .map(declaration => declaration.split(":").map(s => s.trim()))
      )
      : {}

  Object.entries(styles)
    .forEach(([property, value]) => {
      if (value != null && typeof value !== "boolean")
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
export const applyClasses = (
  element: MetaElement<string, Namespace>,
  classes: ClassesToApply
) => {
  // TODO handle promises

  // Doesn't support proper escaping
  // https://html.spec.whatwg.org/multipage/dom.html#global-attributes:classes-2
  const currentClasses = new Set(
    typeof element.attributes.class === "string"
      ? element.attributes.class
        .split(/\s+/).filter(s => s.length)
      : undefined
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
export const applyAttributes = <
  Name extends string,
  NS   extends Namespace = HTMLNamespace
>(
  element:    MetaElement<Name, NS>,
  attributes: AttributesToApply<Name, NS>
) => {
  Object.assign(element.attributes, attributes)
}

//#endregion

//#region rawString() and t()

export const rawString = (string: LikelyAsString) =>
  new MetaRawString(string)

export const t = (textContent: MaybePromise<LikelyAsString>) =>
  new MetaTextNode(textContent)

//#endregion

//#region JSX integration

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
    MetaElement<Name, HTMLNamespace>

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
    MetaElement<Name, SVGNamespace>

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
    MetaElement<Name, MathMLNamespace>

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
    MetaElement<Name, NS>

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
  if (typeof props.bruh === "object" && !(props.bruh instanceof Promise)) {
    options = props.bruh
    delete props.bruh
  }
  // const { namespace } = options

  const element = new MetaElement<Name, NS>(name)

  if ('children' in props) {
    if (Array.isArray(props.children))
      element.children.push(...props.children)
    else
      element.children.push(props.children)

    delete props.children
  }

  // Apply overloaded props, if possible

  // Inline style object
  if (
    "style" in props &&
    props.style != null &&
    typeof props.style === "object" &&
    !(props.style instanceof Promise)
  ) {
    applyStyles(element, props.style)
    delete props.style
  }

  // Classes object
  if (
    "class" in props &&
    props.class != null &&
    typeof props.class === "object" &&
    !(props.class instanceof Promise)
  ) {
    applyClasses(element, props.class)
    delete props.class
  }

  // The rest of the props are attributes
  applyAttributes(element, props as AttributesToApply<Name, NS>)

  return element
}

export const Fragment =
  <Children extends BruhChild>
  (props: { children: Children }) => props.children

//#endregion

declare global {
  interface HTMLElementTagNameMap {
    "bruh-deferred": HTMLElement
  }
}
declare module "html-info" {
  interface HTMLTagToAttributes {
    "bruh-deferred": {
      "data-replace": `bruh-deferred-${number}`
    }
  }
}

export const replaceDeferredScriptContent
  = `"use strict";`
  + `customElements.define("bruh-deferred",class extends HTMLElement{`
  +   "connectedCallback(){"
  +     "const t=this.previousElementSibling;"
  +     "document.getElementById(this.dataset.replace).replaceWith(t.content);"
  +     "t.remove();"
  +     "this.remove()"
  +   "}"
  + "})"

/**
 * "Content-Security-Policy": `script-src '${replaceDeferredHash}'`
 */
export const replaceDeferredHash =
  "sha512-+xpsela6B2jMNhk2cPpAgB4Z89EeB6yltQ208+kvcbUKlkg11dBjAlj2FbNFxeE0kqOuZhdVVldl3hz1yZD38Q=="

type MetaDocumentDeferFunction =
<P extends BruhChild>
(
  context: {
    placeholder: (id: `bruh-deferred-${number}`) => P
    content: Promise<BruhChild>
  }
) => P

type MetaDocumentFunction = (
  context: {
    defer: MetaDocumentDeferFunction,
    deferred: AsyncIterableIterator<MetaElement<"template" | "bruh-deferred">>,
    replaceDeferredScript: MetaElement<"script">
  }
) => MetaElement<string>

export class MetaDocument {
  #metaElementOrFunction: MetaElement<string> | MetaDocumentFunction

  constructor(metaElementOrFunction: MetaElement<string> | MetaDocumentFunction) {
    this.#metaElementOrFunction = metaElementOrFunction
  }

  * [Symbol.iterator](): IterableIterator<string> {
    if (!(isMetaElement in this.#metaElementOrFunction))
      throw new Error("Not a meta element")

    const metaElement = this.#metaElementOrFunction

    // https://html.spec.whatwg.org/#the-doctype
    yield "<!doctype html>"
    yield* metaElement
  }

  async * [Symbol.asyncIterator](): AsyncIterableIterator<string> {
    // https://html.spec.whatwg.org/#the-doctype
    yield "<!doctype html>"
    if (isMetaElement in this.#metaElementOrFunction) {
      const metaElement = this.#metaElementOrFunction
      yield* metaElement
      return
    }

    const documentFunction = this.#metaElementOrFunction

    const deferQueue = makePromiseQueue<{ id: `bruh-deferred-${number}`, content: BruhChild }, unknown>()
    let deferCount = 0
    const defer: MetaDocumentDeferFunction = ({ placeholder, content }) => {
      const id = `bruh-deferred-${deferCount++}` as const
      deferQueue.enqueue(content.then(content => ({ id, content })))
      return placeholder(id)
    }

    // https://html.spec.whatwg.org/#parsing-main-afterbody:parse-errors-3
    // https://html.spec.whatwg.org/#the-after-after-body-insertion-mode:parse-errors
    // Should place deferred content before the closing </body> tag.
    // Placing after is defined to parse as if it was before the </body> anyways,
    // but it's technically a parse error and browsers are allowed to drop the content.
    const deferred = (async function * () {
      for await (const settled of deferQueue) {
        if (settled.status === "rejected") {
          console.error(settled.reason)
          continue
        }
        const { id, content } = settled.value
        yield jsx("template", { children: content })
        yield jsx("bruh-deferred", { "data-replace": id })
      }
    })()

    const replaceDeferredScript = jsx("script", { children: replaceDeferredScriptContent })

    yield* documentFunction({ defer, deferred, replaceDeferredScript })
  }

  toStream(): ReadableStream<Uint8Array> {
    const encoder = new TextEncoder()

    const asyncIterator = this[Symbol.asyncIterator]()

    return new ReadableStream({
      async pull(controller) {
        const { value, done } = await asyncIterator.next()
        if (done) {
          controller.close()
          return
        }

        controller.enqueue(
          encoder.encode(value)
        )
      }
    })
  }

  toString(): string {
    let result = ""
    for (const chunk of this)
      result += chunk
    return result
  }

  async toStringPromise(): Promise<string> {
    let result = ""
    for await (const chunk of this)
      result += chunk
    return result
  }
}
