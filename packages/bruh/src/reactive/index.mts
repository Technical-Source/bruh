import { attempt, isSameValueZero } from "../utils/index.mts"

interface Observer {
  weakRef: WeakRef<Observer>,
  dependencies: Set<Reactive<unknown>>,
  isDisposed: boolean,
  markDirty: () => void
}

let currentObserver: Observer | undefined
const observerStack: (Observer | undefined)[] = []

const pushObserver = (next: Observer | undefined) => {
  observerStack.push(currentObserver)
  currentObserver = next
}

const popObserver = () => {
  currentObserver = observerStack.pop()
}

const trackWith = <T extends unknown>(observer: Observer | undefined, f: () => T): T => {
  pushObserver(observer)
  try {
    return f()
  }
  finally {
    popObserver()
  }
}

export const untrack = <T extends unknown>(f: () => T): T => {
  return trackWith(undefined, f)
}

const dirtyEffects = new Set<Effect>()
let isFlushScheduled = false
let isFlushing = false

const scheduleFlush = () => {
  if (isFlushScheduled || isFlushing)
    return

  isFlushScheduled = true
  queueMicrotask(flush)
}

export const flush = () => {
  if (isFlushing)
    return

  isFlushing = true
  isFlushScheduled = false

  try {
    while (dirtyEffects.size) {
      const wave = [...dirtyEffects]
      dirtyEffects.clear()
      for (const effect of wave)
        if (!effect.isDisposed)
          effect.run()
    }
  }
  finally {
    isFlushing = false
  }
}

type StopReacting = () => void

export type NonReactive<T = unknown> = T extends Reactive<any> ? never : T

export type MaybeReactive<T> = Reactive<T> | NonReactive<T>

export type NestedReactive<T extends NonReactive> = Reactive<T | NestedReactive<T>>

export type IsEqual<T> = {
  bivarianceHack(a: T, b: T): boolean
}["bivarianceHack"]

export type SourceOptions<T> = {
  isEqual?: IsEqual<T>
}

export type DerivativeOptions<T> = {
  memoKey?: () => unknown,
  isEqual?: IsEqual<T>
}

export type ReadonlyReactive<T> = {
  readonly value: T,
  peek(): T
}

export type WritableReactive<T> = {
  value: T,
  peek(): T
}

export type SourceNode<T>     = Reactive<T> & WritableReactive<T>
export type DerivativeNode<T> = Reactive<T> & ReadonlyReactive<T>

export type ReactiveContext = {
  readonly isTracking: boolean,
  readonly dependencies: ReadonlyArray<Reactive<unknown>>,
  readonly stackDepth: number
}

export class Reactive<T> {
  static get context(): ReactiveContext {
    return {
      isTracking: currentObserver !== undefined,
      dependencies: currentObserver ? [...currentObserver.dependencies] : [],
      stackDepth: observerStack.length
    }
  }

  #value: T
  #getter?: () => T
  #memoKey?: () => unknown
  #lastMemoKey?: unknown
  #isEqual: IsEqual<T> = isSameValueZero
  #dependencies = new Set<Reactive<unknown>>()
  #observers = new Set<WeakRef<Observer>>()
  #isDirty = false
  #isComputing = false

  #ownObserver: Observer

  private constructor(
    options: (
      {
        value: T
      } |
      {
        memoKey?: () => unknown,
        getter: () => T
      }
    ) & {
      isEqual?: IsEqual<T>
    }
  ) {
    this.#ownObserver = {
      dependencies: this.#dependencies,
      isDisposed: false,
      weakRef: undefined!,
      markDirty: () => {
        if (this.#isDirty)
          return

        this.#isDirty = true
        this.#markObserversDirty()
      }
    }
    this.#ownObserver.weakRef = new WeakRef(this.#ownObserver)

    if ("getter" in options) {
      this.#memoKey = options.memoKey
      this.#getter = options.getter
      this.#isDirty = true
      this.#value = undefined as T
    }
    else {
      this.#value = options.value
    }

    if (options.isEqual)
      this.#isEqual = options.isEqual
  }

  static source<T>(value: T, options?: SourceOptions<T>): SourceNode<T> {
    return new Reactive({
      value,
      isEqual: options?.isEqual
    })
  }

  static derived<T>(getter: () => T, options?: DerivativeOptions<T>): DerivativeNode<T> {
    const result = new Reactive({
      getter,
      memoKey: options?.memoKey,
      isEqual: options?.isEqual
    })
    result.#compute()
    return result
  }

  peek() {
    if (this.#isDirty)
      this.#compute()

    return this.#value
  }

  get value() {
    this.#trackAccess()

    return this.peek()
  }

  set value(next: T) {
    if (this.#getter)
      throw new Error("Reactive value is readonly")

    if (this.#isEqual(this.#value, next))
      return

    this.#value = next
    this.#markObserversDirty()
  }

  /**
   * @internal
   */
  removeObserver(observer: Observer) {
    this.#observers.delete(observer.weakRef)
  }

  #trackAccess() {
    if (!currentObserver)
      return

    this.#observers.add(currentObserver.weakRef)
    currentObserver.dependencies.add(this)
  }

  #markObserversDirty() {
    for (const ref of this.#observers) {
      const observer = ref.deref()
      if (observer)
        observer.markDirty()
      else
        this.#observers.delete(ref)
    }
  }

  #clearDependencies() {
    for (const dependency of this.#dependencies)
      dependency.removeObserver(this.#ownObserver)

    this.#dependencies.clear()
  }

  #compute() {
    if (!this.#getter || !this.#isDirty)
      return

    if (this.#isComputing)
      throw new Error("Cycle detected while computing derivation")

    this.#isComputing = true
    this.#isDirty = false
    this.#clearDependencies()

    try {
      if (this.#memoKey) {
        const key = trackWith(this.#ownObserver, this.#memoKey)
        if (isSameValueZero(key, this.#lastMemoKey))
          return
        this.#lastMemoKey = key
      }

      const next = trackWith(this.#ownObserver, this.#getter)
      const changed = !this.#isEqual(this.#value, next)
      if (changed)
        this.#value = next
    }
    catch (e) {
      console.error(e)
    }
    finally {
      this.#isComputing = false
    }
  }
}

type Cleanup = () => void

const activeEffects = new Set<Effect>()

class Effect implements Observer {
  weakRef = new WeakRef(this)
  dependencies = new Set<Reactive<unknown>>()
  isDisposed = false

  #f: () => void | Cleanup
  #cleanup?: () => void

  constructor(f: () => void | Cleanup) {
    this.#f = f

    activeEffects.add(this)

    this.markDirty()
  }

  markDirty() {
    if (this.isDisposed)
      return

    dirtyEffects.add(this)
    scheduleFlush()
  }

  run() {
    if (this.isDisposed)
      return

    if (this.#cleanup) {
      attempt(this.#cleanup)
      this.#cleanup = undefined
    }

    for (const dependency of this.dependencies)
      dependency.removeObserver(this)
    this.dependencies.clear()

    const result = trackWith(this, () => attempt(this.#f))
    if (typeof result === "function")
      this.#cleanup = result
  }

  dispose() {
    if (this.isDisposed)
      return

    this.isDisposed = true

    activeEffects.delete(this)

    dirtyEffects.delete(this)

    if (this.#cleanup)
      attempt(this.#cleanup)

    for (const dependency of this.dependencies)
      dependency.removeObserver(this)
    this.dependencies.clear()
  }
}

type WatchOptionsAuto = {
}

type WatchOptionsExplicit = {
  skipFirst?: boolean
}

type Watch = {
  /**
   * Auto-tracking effect: tracks all .value reads in the callback
   */
  (f: () => void | Cleanup, options?: WatchOptionsAuto): StopReacting

  /**
   * Explicit dependency effect: tracks only the specified dependencies,
   * runs the callback untracked when any dependency changes
   */
  <Dependencies extends ReadonlyArray<Reactive<unknown>>>(
    dependencies: Dependencies | (() => Dependencies),
    f: () => void | Cleanup,
    options?: WatchOptionsExplicit
  ): StopReacting
}

export const watch: Watch = <
  Dependencies extends ReadonlyArray<Reactive<unknown>>
>(
  fOrDependencies: (() => void | Cleanup) | Dependencies | (() => Dependencies),
  fOrOptions?: (() => void | Cleanup) | WatchOptionsAuto,
  options?: WatchOptionsExplicit
): StopReacting => {
  // Auto-tracking mode: watch(f) or watch(f, options)
  if (typeof fOrDependencies === "function" && (fOrOptions === undefined || typeof fOrOptions !== "function")) {
    const f = fOrDependencies as () => void | Cleanup
    const options = fOrOptions

    const effect = new Effect(f)
    return () => {
      effect.dispose()
    }
  }

  // Explicit dependencies mode: watch(dependencies, f, options?)
  const dependenciesOrGet = fOrDependencies as Dependencies | (() => Dependencies)
  const f = fOrOptions as () => void | Cleanup

  let isFirst = true
  const effect = new Effect(() => {
    const dependencies =
      typeof dependenciesOrGet === "function"
        ? untrack(dependenciesOrGet)
        : dependenciesOrGet
    for (const dependency of dependencies)
      dependency.value

    if (isFirst) {
      isFirst = false
      if (options?.skipFirst)
        return
    }

    return untrack(f)
  })
  return () => {
    effect.dispose()
  }
}

type R = {
  /**
   * A derived node with auto-tracking
   */
  <T>(
    f: () => T,
    options?: DerivativeOptions<T>
  ): DerivativeNode<T>

  /**
   * A derived node with explicit dependencies:
   * tracks only the specified dependencies, runs the getter untracked
   */
  <T, Dependencies extends ReadonlyArray<Reactive<unknown>>>(
    dependencies: Dependencies | (() => Dependencies),
    f: () => T,
    options?: DerivativeOptions<T>
  ): DerivativeNode<T>

  /**
   * An initially undefined source node
   */
  <T>(): SourceNode<T | undefined>

  /**
   * A source node
   */
  <T>(value: T, options?: SourceOptions<T>): SourceNode<T>
}
/**
 * A convenient wrapper for Reactive
 */
export const r: R = <T extends unknown, Dependencies extends ReadonlyArray<Reactive<unknown>>>(
  xOrFOrDependencies?: T | (() => T) | Dependencies | (() => Dependencies),
  optionsOrF?: SourceOptions<T> | DerivativeOptions<T> | (() => T),
  options?: DerivativeOptions<T>
) => {
  // r(dependencies, f) or r(() => dependencies, f) - explicit dependency mode
  const isExplicit =
    (Array.isArray(xOrFOrDependencies) || typeof xOrFOrDependencies === "function") &&
    typeof optionsOrF === "function"

  if (isExplicit) {
    const dependenciesOrGet = xOrFOrDependencies as Dependencies | (() => Dependencies)
    const f = optionsOrF

    return Reactive.derived(() => {
      const dependencies =
      typeof dependenciesOrGet === "function"
        ? untrack(dependenciesOrGet)
        : dependenciesOrGet
      for (const dependency of dependencies)
        dependency.value

      return untrack(f)
    }, options)
  }
  else {
    const options = optionsOrF as SourceOptions<T> | DerivativeOptions<T>

    // r(f) - auto-tracking derived
    if (typeof xOrFOrDependencies === "function") {
      const f = xOrFOrDependencies as () => T

      return Reactive.derived(f, options as DerivativeOptions<T>)
    }

    // r() or r(value) - source node
    const x = xOrFOrDependencies as T

    return Reactive.source(x, options as SourceOptions<T>)
  }
}

export const getValue = <T extends unknown>(x: MaybeReactive<T>) =>
  x instanceof Reactive
    ? x.value
    : x

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
    value: NonReactive<T>,
    f: (value: NonReactive<T>) => unknown
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
  if (x instanceof Reactive)
    return watch(() => {
      const value = x.value
      untrack(() => f(value))
    })

  f(x)
}

const flatCache = new WeakMap<Reactive<unknown>, Reactive<unknown>>()

export const flat = <T extends unknown>(nested: NestedReactive<T>): Reactive<T> => {
  const cached = flatCache.get(nested)
  if (cached)
    return cached as Reactive<T>

  const derived = r(() => {
    let cursor: unknown = nested.value
    while (cursor instanceof Reactive)
      cursor = cursor.value
    return cursor as T
  })

  flatCache.set(nested, derived)
  return derived
}
