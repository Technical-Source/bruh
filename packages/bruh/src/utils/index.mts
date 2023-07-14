/**
 * Create a pipeline with an initial value and a series of functions
 * The typescript typing for this is too complex lol
 */
export const pipe = (x: any, ...fs: Array<(x: any) => any>) =>
  fs.reduce((y, f) => f(y), x)

/**
 * Dispatch a custom event to (capturing) and from (bubbling) a target (usually a DOM node).
 * Returns false if the event was cancelled (preventDefault()) and true otherwise.
 *
 * Note that this is synchronous
 */
export const dispatch = (target: EventTarget, type: string, options: CustomEventInit) =>
  target.dispatchEvent(
    // Default to behave like most DOM events
    new CustomEvent(type, {
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
  const T extends Record<any, unknown>,
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
export const functionAsObject = <T extends unknown>(
  f: (property: string | symbol) => T
): Record<string | symbol, T> =>
  new Proxy({}, {
    get: (_, property) => f(property)
  })

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
