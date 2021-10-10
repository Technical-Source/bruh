import { Reactive } from "../reactive"

declare type MaybeReactiveRecord<T> = Record<string, T | Reactive<T>>

declare const isReactive:     unique symbol
declare const isMetaNode:     unique symbol
declare const isMetaTextNode: unique symbol
declare const isMetaElement:  unique symbol

declare type Stringifyable = { toString: () => string }

declare type NonReactiveMetaNodeChild =
  | MetaNode
  | Node
  | string
  | number
  | Array<NonReactiveMetaNodeChild>

export declare type MetaNodeChild =
  | NonReactiveMetaNodeChild
  | Reactive<NonReactiveMetaNodeChild>

export declare type childrenToNodes = (children: Array<MetaNodeChild>) => Array<Node>

export declare type MetaNode = {
  [isMetaNode]: true
  node: Node
  addProperties: (properties: object) => MetaNode
}

export declare class MetaTextNode implements MetaNode {
  constructor(value: string)

  [isMetaNode]:     true
  [isMetaTextNode]: true
  node: Text
  addProperties: (properties: object) => MetaNode
}

export declare class MetaElement implements MetaNode {
  constructor(name: string, namespace?: string)

  static from: (element: Element) => MetaElement

  [isMetaNode]:    true
  [isMetaElement]: true
  node: Element
  addProperties:     (properties: object) => MetaNode

  addAttributes:     (attributes:     MaybeReactiveRecord<Stringifyable | void>) => MetaNode
  addDataAttributes: (dataAttributes: MaybeReactiveRecord<Stringifyable | void>) => MetaNode
  addStyles:         (styles:         MaybeReactiveRecord<Stringifyable | void>) => MetaNode
  toggleClasses:     (classes:        MaybeReactiveRecord<boolean>)       => MetaNode

  before:          (...children: Array<MetaNodeChild>) => MetaNode
  prepend:         (...children: Array<MetaNodeChild>) => MetaNode
  append:          (...children: Array<MetaNodeChild>) => MetaNode
  after:           (...children: Array<MetaNodeChild>) => MetaNode
  replaceChildren: (...children: Array<MetaNodeChild>) => MetaNode
  replaceWith:     (...children: Array<MetaNodeChild>) => MetaNode
}

export declare class MetaHTMLElement<Name extends keyof HTMLElementTagNameMap> extends MetaElement {
  constructor(name: Name, namespace?: "http://www.w3.org/1999/xhtml")
  node: HTMLElementTagNameMap[Name]
}
export declare class MetaSVGElement<Name extends keyof SVGElementTagNameMap> extends MetaElement {
  constructor(name: Name, namespace: "http://www.w3.org/2000/svg")
  node: SVGElementTagNameMap[Name]
}

export declare const hydrateTextNodes: () => Record<string, Text>

declare const createMetaTextNode: (value: string) => MetaTextNode

declare const createMetaElement: {
  <Name extends keyof HTMLElementTagNameMap>
  (name: Name, namespace?: "http://www.w3.org/1999/xhtml"): {
    (                                                ...children: Array<MetaNodeChild>): MetaHTMLElement<Name>
    (attributes: MaybeReactiveRecord<Stringifyable | void>, ...children: Array<MetaNodeChild>): MetaHTMLElement<Name>
  }

  <Name extends keyof SVGElementTagNameMap>
  (name: Name, namespace: "http://www.w3.org/2000/svg"): {
    (                                                ...children: Array<MetaNodeChild>): MetaSVGElement<Name>
    (attributes: MaybeReactiveRecord<Stringifyable | void>, ...children: Array<MetaNodeChild>): MetaSVGElement<Name>
  }

  (name: string, namespace?: string): {
    (                                                ...children: Array<MetaNodeChild>): MetaNode
    (attributes: MaybeReactiveRecord<Stringifyable | void>, ...children: Array<MetaNodeChild>): MetaNode
  }
}

declare const createMetaElementJSX: {
  <Name extends keyof HTMLElementTagNameMap>
  (name: Name, attributes: MaybeReactiveRecord<Stringifyable | void>, ...children: Array<MetaNodeChild>): MetaHTMLElement<Name>

  <Props, Child, ReturnType>
  (
    component: (propsAndChildren: Props & { children: Array<Child> }) => ReturnType,
    props: Props,
    ...children: Array<Child>
  ): ReturnType
}

export {
  createMetaTextNode   as t,
  createMetaElement    as e,
  createMetaElementJSX as h
}

declare const JSXFragment: <Child>(argument: { children: Array<Child> }) => Array<Child>
