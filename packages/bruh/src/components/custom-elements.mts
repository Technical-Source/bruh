import { type SourceNode, r } from "../reactive/index.mts";
import { attempt } from "../utils/index.mts";

export class CustomElement extends HTMLElement {
  // https://html.spec.whatwg.org/multipage/custom-elements.html#element-definition
  /**
   * Which attributes to observe for `attributeChangedCallback()`
   */
  static observedAttributes?: ReadonlyArray<string>

  /**
   * Disable `attachInternals()` and/or `attachShadow()`
   */
  static disabledFeatures?: ReadonlyArray<"internals" | "shadow">

  /**
   * Whether the element is form-associated
   */
  static formAssociated?: boolean

  // https://html.spec.whatwg.org/multipage/custom-elements.html#custom-element-reactions
  /**
   * Called whenever the element is connected to a document
   * @see https://html.spec.whatwg.org/multipage/infrastructure.html#becomes-connected
   */
  connectedCallback?(): void

  /**
   * Called whenever the element is disconnected from a document
   * @see https://html.spec.whatwg.org/multipage/infrastructure.html#becomes-disconnected
   */
  disconnectedCallback?(): void

  /**
   * Called whenever the element is moved to a new document
   * @see https://dom.spec.whatwg.org/#concept-node-move-ext
   */
  connectedMoveCallback?(): void

  /**
   * Called whenever the element is adopted by a new document
   * @see https://dom.spec.whatwg.org/#concept-node-adopt
   */
  adoptedCallback?(oldDocument: Document, newDocument: Document): void

  /**
   * Called whenever an attribute is changed, appended, removed, or replaced
   * @see https://dom.spec.whatwg.org/#concept-element-attributes-change-ext
   */
  attributeChangedCallback?(name: string, oldValue: string | null, newValue: string | null, namespace: string | null): void

  /**
   * Called (if the element is form-associated) whenever the form "owner" of the element is reset and doing so changes the form that owns the element
   * @see https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#reset-the-form-owner
   */
  formAssociatedCallback?(formOwner: HTMLFormElement | null): void

  /**
   * Called (if the element is form-associated) whenever the form "owner" of the element is reset
   * @see https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#concept-form-reset
   */
  formResetCallback?(): void

  /**
   * Called (if the element is form-associated) whenever the element is disabled or enabled
   * @see https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#concept-fe-disabled
   */
  formDisabledCallback?(isDisabled: boolean): void

  /**
   * Called (if the element is form-associated) whenever the element's value is restored
   * @see https://html.spec.whatwg.org/multipage/browsing-the-web.html#restore-persisted-state
   */
  formStateRestoreCallback?(
    state: FormDataEntryValue | FormDataIterator<[string, FormDataEntryValue]> | null,
    reason: "autocomplete" | "restore"
  ): void
}

type ThisConstructor<BaseClass extends BruhCustomElementBase> = BaseClass extends BruhCustomElementBase<infer Attributes> ? typeof BruhCustomElementBase & {
  observedAttributes?: ReadonlyArray<keyof Attributes>
  bruh?: {
    parseAttributes?: {
      [A in keyof Attributes]?: (raw: string | null) => Attributes[A]
    }
  }
} : never

export class BruhCustomElementBase<
  Attributes extends { [attribute: string]: any}  = {}
> extends CustomElement {
  static bruh?: {
    parseAttributes?: Partial<{
      [attribute: string]: (raw: string | null) => any
    }>
  }

  bruh = {
    attributes: {} as {
      [A in (keyof Attributes & string)]: SourceNode<Attributes[A] | undefined>
    }
  };

  #setBruhAttribute<A extends keyof Attributes & string>(
    name: A,
    value = this.getAttribute(name)
  ) {
    const constructor = this.constructor as ThisConstructor<this>
    const parse = constructor.bruh?.parseAttributes?.[name]

    this.bruh.attributes[name] ??= r()
    this.bruh.attributes[name].value =
      parse
        ? attempt(() => parse(value))
        : value ?? undefined
  }

  constructor() {
    super()

    const { observedAttributes } = this.constructor as ThisConstructor<this>

    if (observedAttributes)
      for (const name of observedAttributes)
        this.#setBruhAttribute(name)
  }

  attributeChangedCallback<A extends keyof Attributes & string>(
    name: A,
    oldValue: string | null,
    newValue: string | null,
    namespace: string | null
  ) {
    this.#setBruhAttribute(name, newValue)
  }

  #mounted = false;
  /**
   * Overrides must call `super.connectedCallback()`
   */
  connectedCallback() {
    if (this.#mounted) return
    this.mountedCallback?.()
    this.#mounted = true
  }

  /**
   * Called when the element is first connected to a document
   */
  mountedCallback?(): void
}
