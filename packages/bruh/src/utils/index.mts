/**
 * Dispatch a custom event to (capturing) and from (bubbling) a target (usually a DOM node).
 * Returns false if the event was cancelled (preventDefault()) and true otherwise.
 *
 * Note that this is synchronous
 */
export const dispatch = (
  target: EventTarget,
  type: string,
  detail: unknown,
  options: CustomEventInit
) =>
  target.dispatchEvent(
    // Default to behave like most DOM events
    new CustomEvent(type, {
      detail,
      bubbles: true,
      cancelable: true,
      composed: true,
      ...options
    })
  )

/**
 * Inspired by https://antfu.me/posts/destructuring-with-object-or-array#take-away
 *
 * Creates an object that is both destructable with {...} and [...]
 *
 * Useful for writing library functions à la react-use & vueuse
 *
 * @example
 * ```typescript
 * const useExample = () => {
 *   const a = "a"
 *   const b = "b"
 *   return createDestructable(
 *     { a, b },
 *     [ a, b ]
 *   )
 * }
 *
 * const { a, b } = useExample()
 * // or
 * const [ a, b ] = useExample()
 * ```
 */
export const createDestructable = <
  const T extends {},
  const U extends Iterable<unknown>
>(
  object: T,
  iterable: U
) => {
  const destructable = {
    ...object,
    [Symbol.iterator]: () => iterable[Symbol.iterator]()
  }

  Object.defineProperty(destructable, Symbol.iterator, {
    enumerable: false
  })

  return destructable as T & U
}

/**
 * Creates an object (as a Proxy) that acts as a function
 *
 * So functionAsObject(f).property is equivalent to f("property")
 *
 * This is can be useful when combined with destructuring syntax
 *
 * @example
 * ```typescript
 * const { html, head, title, body, main, h1, p } = functionAsObject(e)
 * ```
 */
export const functionAsObject = <T extends { [input: PropertyKey]: any }>(
  f: <K extends keyof T>(property: K) => T[K]
) =>
  new Proxy({}, {
    get: (_, property) => f(property)
  }) as T

export const mapObject = <
  const O extends {},
  const K extends keyof O,
  const V extends O[K],
  const RK extends PropertyKey,
  const RV
>(
  o: O,
  f: ([k, v]: [K, V]) => [RK, RV]
): {
  [
    Entry in
    { [Key in keyof O]: [RK, RV] }[keyof O]
    as Entry[0]
  ]: Entry[1]
} =>
  Object.fromEntries(
    Object.entries(o).map(f as any) as any
  ) as any

export type InvertObject<O extends Record<PropertyKey, PropertyKey>> = {
  [
    Entry in
    { [Key in keyof O]: [O[Key], Key] }[keyof O]
    as Entry[0]
  ]: Entry[1]
}

export const invertObject = <const O extends Record<PropertyKey, PropertyKey>>(o: O): InvertObject<O> =>
  mapObject(o, ([key, value]) => [value, key] as const)

const x = invertObject({ a: 1, b: 2, c: 3 })
type X = typeof x

const x2 = mapObject({ a: 1, b: 2, c: 3 }, ([key, value]) => [value, key] as const)
type X2 = typeof x2

export const camelToDashCase = (s: string) =>
  s.replace(/[A-Z]/g, c => "-" + c.toLowerCase())

export const dashToCamelCase = (s: string) =>
  s.replace(/-[a-z]/g, dc => dc[1].toUpperCase())

export const unique = <T, K>(
  values: Iterable<T>,
  getKey?: (value: T) => K
) => {
  if (!getKey)
    return [...new Set(values)]

  const seen = new Map<K, T>()
  for (const value of values) {
    const key = getKey(value)
    if (!seen.has(key))
      seen.set(key, value)
  }
  return [...seen.values()]
}

const report = (e: unknown) => {
  console.error(e)
}
export const attempt: {
  <T, R = undefined>(f: () => T, recover?: (e: unknown) => R): T | R,
  <T, R = undefined>(f: () => Promise<T>, recover?: (e: unknown) => R): Promise<T | R>
} = <T extends unknown>(f: () => T | Promise<T>, recover = report) => {
  try {
    const result = f()

    if (result instanceof Promise)
      return result.catch(recover)

    return result
  }
  catch (e) {
    return recover(e)
  }
}

type FulfilledSelfReferencingPromise<T extends unknown> =
  Promise<
    {
      promise: FulfilledSelfReferencingPromise<T>,
      settled: {
        status: "fulfilled",
        value: T
      }
    }
  >

type RejectedSelfReferencingPromise<E extends unknown> =
  Promise<
    {
      promise: RejectedSelfReferencingPromise<E>,
      settled: {
        status: "rejected",
        reason: E
      }
    }
  >

type SelfReferencingPromise<T extends unknown, E extends unknown> =
  | FulfilledSelfReferencingPromise<T>
  | RejectedSelfReferencingPromise<E>

export const makePromiseQueue = <T extends unknown, E extends unknown>() => {
  const queue = new Set<SelfReferencingPromise<T, E>>()

  const enqueue = (promise: Promise<T>) => {
    const recursivePromise = promise
      .then(resolved => ({
        promise: recursivePromise,
        settled: {
          status: "fulfilled",
          value: resolved
        }
      }))
      .catch(rejected => ({
        promise: recursivePromise,
        settled: {
          status: "rejected",
          reason: rejected as E
        }
      })) as SelfReferencingPromise<T, E>

    queue.add(recursivePromise)
  }

  const dequeue = async () => {
    const { promise, settled } = await Promise.race<SelfReferencingPromise<T, E>>(queue)
    queue.delete(promise)
    return settled
  }

  return {
    enqueue,

    async * [Symbol.asyncIterator]() {
      while (queue.size)
        yield await dequeue()
    }
  }
}
