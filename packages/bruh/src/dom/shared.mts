import type { MaybeReactive } from "../reactive/index.mjs"
import type { PropertiesHyphen } from "csstype"

import type {
  HTMLTag,
  SVGTag,
  Namespace,
  HTMLNamespace,
  SVGNamespace,
  ElementType,
  HTMLTagToEventMap,
  SVGTagToEventMap,
  ElementToAttributes,
  GlobalAttributes,
  HTMLTagToAttributes,
  SVGTagToAttributes
} from "html-info"
export type {
  HTMLTag,
  SVGTag,
  Namespace,
  HTMLNamespace,
  SVGNamespace,
  ElementType,
  HTMLTagToEventMap,
  SVGTagToEventMap,
  ElementToAttributes,
  GlobalAttributes,
  HTMLTagToAttributes,
  SVGTagToAttributes
}

type PropertyWiseOr<
  A extends {},
  B extends {}
> = {
  [K in keyof (A & B)]
    : K extends keyof (A | B)
      ? (A | B)[K]
    : K extends keyof A
      ? A[K]
    : K extends keyof B
      ? B[K]
      : never
}

export type LikelyAsString =
  string |
  number | bigint

export type LikelyAsAbsent =
  null | undefined |
  // showSomething && something
  // hideSomething || something
  boolean

export type LikelyAsBoolean =
  boolean |
  // treated as false in this case
  null | undefined

/**
 * Extensible interface for CSS properties.
 *
 * ```tsx
 * declare module "bruh/dom" {
 *   interface Styles {
 *     "--custom"?: "red" | "green" | "blue"
 *   }
 * }
 *
 * // Now typescript verifies this JSX:
 * <div style={{ "--custom": "blue" }} />
 * ```
 */
export interface Styles extends PropertiesHyphen {}

export type StylesToApply = {
  [Property in keyof Styles]: MaybeReactive<Styles[Property] | LikelyAsAbsent>
}

export type ClassesToApply = {
  [className: string]: MaybeReactive<LikelyAsBoolean>
}

export type AttributesToApply<
  Name extends string,
  NS   extends Namespace = HTMLNamespace
> = {
  [Attribute in keyof ElementToAttributes<Name, NS>]?:
    MaybeReactive<ElementToAttributes<Name, NS>[Attribute] | LikelyAsAbsent>
}

type EventMapToListenerProps<EventMap> = Partial<{
  [E in ((keyof EventMap) & string) as `on${E}`]:
    (event: EventMap[E]) => unknown
}>

// Element tag names to (prop names to listener functions)
type HTMLTagToListenerProps = { [Name in HTMLTag]: EventMapToListenerProps<HTMLTagToEventMap[Name]> }
type  SVGTagToListenerProps = { [Name in  SVGTag]: EventMapToListenerProps< SVGTagToEventMap[Name]> }
type    GlobalListenerProps = EventMapToListenerProps<ElementEventMap & GlobalEventHandlersEventMap>

type HTMLTagToAttributeProps = {
  [Name in HTMLTag]: {
    [Attribute in keyof HTMLTagToAttributes[Name]]?:
      MaybeReactive<HTMLTagToAttributes[Name][Attribute] | LikelyAsAbsent>
  }
}
type SVGTagToAttributeProps = {
  [Name in SVGTag]: {
    [Attribute in keyof SVGTagToAttributes[Name]]?:
      MaybeReactive<SVGTagToAttributes[Name][Attribute] | LikelyAsAbsent>
  }
}
type GlobalAttributeProps = {
  [Attribute in keyof GlobalAttributes]?:
    MaybeReactive<GlobalAttributes[Attribute] | LikelyAsAbsent>
}

type HTMLTagToProps_ = HTMLTagToListenerProps & HTMLTagToAttributeProps
type  SVGTagToProps_ =  SVGTagToListenerProps &  SVGTagToAttributeProps
type    GlobalProps_ =    GlobalListenerProps &    GlobalAttributeProps

export interface HTMLTagToProps extends HTMLTagToProps_ {}
export interface  SVGTagToProps extends  SVGTagToProps_ {}
export interface    GlobalProps extends    GlobalProps_ {}

export type BruhOptions = {
  namespace?: Namespace
}

type BaseBruhProps = {
  bruh?:  BruhOptions,
  style?: StylesToApply,
  class?: ClassesToApply
}

export type BruhProps<
  Name extends string,
  NS   extends string = HTMLNamespace
>
  = NS extends HTMLNamespace
    ?
      BaseBruhProps
        & { bruh?: { namespace?: HTMLNamespace } }
        & (
          Name extends HTMLTag
            ? HTMLTagToProps[Name]
            : GlobalProps
        )
  : NS extends SVGNamespace
    ?
      BaseBruhProps
        & { bruh: { namespace: SVGNamespace } }
        & (
          Name extends SVGTag
            ? SVGTagToProps[Name]
            : GlobalProps
        )
  :
    BaseBruhProps
      & { bruh: { namespace: NS } }
      & GlobalProps

export type HTMLTagToBruhProps = { [Name in HTMLTag]: BruhProps<Name, HTMLNamespace> }
export type  SVGTagToBruhProps = { [Name in  SVGTag]: BruhProps<Name,  SVGNamespace> }

type JSXIntrinsicElements = PropertyWiseOr<HTMLTagToBruhProps, SVGTagToBruhProps>

declare global {
  namespace JSX {
    /** @see https://www.typescriptlang.org/docs/handbook/jsx.html#children-type-checking */
    interface ElementChildrenAttribute { children: {} }

    /** @see https://www.typescriptlang.org/docs/handbook/jsx.html#attribute-type-checking */
    interface IntrinsicElements extends JSXIntrinsicElements {}

    type ElementType = keyof JSXIntrinsicElements | Function
  }
}
