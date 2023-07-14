export const isReactiveSymbol = Symbol.for("bruh reactive")

export const isReactive = (x: unknown): x is Reactive<unknown> =>
  // @ts-ignore
  x?.[isReactiveSymbol] === true

type Reaction = () => void
type StopReacting = () => void

export type Reactive<T> = {
  [isReactiveSymbol]: true

  value: T

  addReaction(reaction: Reaction): StopReacting
}

export type Unreactive<T> = Exclude<T, { [isReactiveSymbol]: true }>

export type MaybeReactive<T> = Reactive<T> | Unreactive<T>

/**
 * A super simple and performant reactive value implementation
 */
export class SimpleReactive<T> implements Reactive<T> {
  [isReactiveSymbol] = true as const

  #value: T
  #reactions = new Set<Reaction>()

  constructor(value: T) {
    this.#value = value
  }

  get value() {
    return this.#value
  }

  set value(newValue) {
    if (newValue === this.#value)
      return

    this.#value = newValue
    for (const reaction of this.#reactions)
      reaction()
  }

  /**
   * @param reaction called every time that the value changes
   * @returns a function that stops the reactions
   */
  addReaction(reaction: Reaction) {
    this.#reactions.add(reaction)

    return () =>
      this.#reactions.delete(reaction)
  }
}

type SourceNode<T>     = FunctionalReactive<T, "source">
type DerivativeNode<T> = FunctionalReactive<T, "derivative">
type DependencyNode<T> = FunctionalReactive<T, any>

/**
 * A reactive implementation for building functional reactive graphs.
 * Ensures state consistency, minimal node updates, and transparent update batching.
 */
export class FunctionalReactive<T, U extends "source" | "derivative"> implements Reactive<T> {
  [isReactiveSymbol] = true as const

  #weakRef = new WeakRef(this)

  #value: T
  #reactions = new Set<Reaction>()

  // For derived nodes, this is the derivation function
  #f:
    U extends "derivative"
      ? () => T
      : undefined

  // Source nodes are 0 deep in the derivation graph
  // This is for topological sort
  #depth:
    U extends "source"
      ? 0
      : number // natural, > 0
    = 0

  // All nodes have a set of derivatives that update when the node changes
  #derivatives = new Set<WeakRef<DerivativeNode<unknown>>>()

  // Keep track of all the pending changes from the value setter
  static #settersQueue = new Map<SourceNode<unknown>, unknown>()

  // A queue of derivatives to potentially update, sorted into sets by depth
  // This starts with depth 1 and can potentially have holes
  static #derivativesQueue: Array<Set<DerivativeNode<unknown>> | undefined> = []

  // A queue of reactions to run after the graph is fully updated
  static #reactionsQueue: Array<Reaction> = []

  constructor(value: T)
  constructor(
    dependencies: ReadonlyArray<DependencyNode<unknown>>,
    f: () => T
  )
  constructor(
    x: T | ReadonlyArray<DependencyNode<unknown>>,
    f?: undefined | (() => T)
  ) {
    // No derivation function means this is a source node
    if (!f) {
      const this_ = this as SourceNode<T>
      const value = x as T

      this_.#value = value
      return
    }

    // Derived node
    const this_ = this as DerivativeNode<T>
    const dependencies = x as ReadonlyArray<DependencyNode<unknown>>

    this_.#value = f()
    this_.#f = f

    this_.#depth = Math.max(0, ...dependencies.map(dependency => dependency.#depth)) + 1

    dependencies.forEach(dependency => dependency.#derivatives.add(this_.#weakRef))
  }

  get value(): T {
    // If there are any pending updates
    if (FunctionalReactive.#settersQueue.size) {
      // If this is a source node that was updated, just return that
      // new value without actually updating any derived nodes yet
      if (this.#depth === 0) {
        const this_ = this as SourceNode<T>
        if (FunctionalReactive.#settersQueue.has(this_))
          return FunctionalReactive.#settersQueue.get(this_) as T
      }
      // Heuristic quick invalidation for derived nodes
      // Apply updates now, it's ok that there's already a microtask queued for this
      else {
        FunctionalReactive.applyUpdates()
      }
    }

    return this.#value
  }

  set value(newValue) {
    // Only allow source nodes to be directly updated
    if (this.#depth !== 0)
      return

    const this_ = this as SourceNode<T>

    // Unless asked for earlier, these updates are just queued up until the microtasks run
    if (!FunctionalReactive.#settersQueue.size)
      queueMicrotask(FunctionalReactive.applyUpdates)

    FunctionalReactive.#settersQueue.set(this_, newValue)
  }

  /**
   * @param reaction called every time that the value changes
   * @returns a function that stops the reactions
   */
  addReaction(reaction: Reaction) {
    this.#reactions.add(reaction)

    return () =>
      this.#reactions.delete(reaction)
  }

  // Apply an update for a node and queue its derivatives if it actually changed
  #applyUpdate(newValue: T) {
    if (newValue === this.#value)
      return

    this.#value = newValue
    FunctionalReactive.#reactionsQueue.push(...this.#reactions)

    this.#derivatives.forEach(weakRef => {
      const derivative = weakRef.deref()
      if (!derivative) {
        this.#derivatives.delete(weakRef)
        return
      }

      const depthSet = FunctionalReactive.#derivativesQueue[derivative.#depth] ??= new Set()
      depthSet.add(derivative)
    })
  }

  /**
   * Apply pending updates from actually changed source nodes
   */
  static applyUpdates() {
    if (!FunctionalReactive.#settersQueue.size)
      return

    // Bootstrap by applying the updates from the pending setters
    for (const [sourceNode, newValue] of FunctionalReactive.#settersQueue.entries())
      sourceNode.#applyUpdate(newValue)
    FunctionalReactive.#settersQueue.clear()

    // Iterate down the depths, ignoring holes
    // Note that both the queue (Array) and each depth Set iterators update as items are added
    for (const depthSet of FunctionalReactive.#derivativesQueue) if (depthSet)
      for (const derivative of depthSet)
        derivative.#applyUpdate(derivative.#f())
    FunctionalReactive.#derivativesQueue.length = 0

    // Call all reactions now that the graph has a fully consistent state
    for (const reaction of FunctionalReactive.#reactionsQueue)
      reaction()
    FunctionalReactive.#reactionsQueue.length = 0
  }
}

type R = {
  /**
   * An initially undefined source node
   */
  <T>(): SourceNode<T | undefined>

  /**
   * A source node
   */
  <T>(value: T): SourceNode<T>

  /**
   * A derived node
   */
  <T>(
    dependencies: ReadonlyArray<DependencyNode<unknown>>,
    f: () => T
  ): DerivativeNode<T>
}
/**
 * A convenient wrapper for FunctionalReactive
 */
export const r: R = <T extends unknown>(
  x?: T | ReadonlyArray<DependencyNode<unknown>>,
  f?: undefined | (() => T)
) =>
  // @ts-ignore
  new FunctionalReactive(x, f)

type ReactiveDo = {
  /**
   * Calls the given function with the reactive's value whenever it changes
   * @returns a function that stops the reactions
   */
  <T>(
    reactive: Reactive<T>,
    f: (value: T) => unknown
  ): StopReacting

  /**
   * Calls the given function with the value once
   */
  <T>(
    value: Unreactive<T>,
    f: (value: Unreactive<T>) => unknown
  ): undefined

  /**
   * If the value is not reactive, it calls the given function with that value once.
   * If it is a reactive value, it calls the given function with the reactive's value whenever it changes.
   * @returns a function that stops the reactions, if the value is reactive
   */
  <T>(
    x: MaybeReactive<T>,
    f: (value: T) => unknown
  ): StopReacting | undefined
}
/**
 * Do something with a value, updating if it is reactive
 */
export const reactiveDo: ReactiveDo = <T extends unknown>(
  x: MaybeReactive<T>,
  f: (value: T) => unknown
): any => {
  if (isReactive(x)) {
    f(x.value)
    return x.addReaction(() => f(x.value))
  }

  f(x)
}
