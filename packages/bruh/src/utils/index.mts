import type { LikelyAsString } from "../dom/types.mts"

// https://tc39.es/ecma262/multipage/abstract-operations.html#sec-samevaluezero
export const isSameValueZero = (a: unknown, b: unknown) => {
  // fix NaN !== NaN
  if (
    typeof a === "number" &&
    typeof b === "number"
  )
    return (
      a === b ||
      (
        a !== a &&
        b !== b
      )
    )

  return a === b
}

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

export const pick = <T, K extends keyof T>(t: T, ...keys: ReadonlyArray<K>) => {
  const picked = {} as Pick<T, K>

  for (const key of keys)
    picked[key] = t[key]

  return picked
}

export const omit = <T, K extends keyof T>(t: T, ...keys: ReadonlyArray<K>) => {
  const unomitted: Partial<T> = { ...t }

  for (const key of keys)
    delete unomitted[key]

  return unomitted as Omit<T, K>
}

export const mapObject = <
  O extends Record<PropertyKey, unknown>,
  RK extends PropertyKey,
  RV
>(
  o: O,
  f: (entry: [keyof O, O[keyof O]]) => readonly [RK, RV]
): Record<RK, RV> =>
  Object.fromEntries(
    (Object.entries(o) as [keyof O, O[keyof O]][]).map(f)
  ) as Record<RK, RV>

export const mapValues = <
  O extends Record<PropertyKey, unknown>,
  RV
>(
  o: O,
  f: (value: O[keyof O], key: keyof O) => RV
): { [K in keyof O]: RV } =>
  Object.fromEntries(
    Object.entries(o).map(([k, v]) => [k, f(v as O[keyof O], k as keyof O)])
  ) as { [K in keyof O]: RV }

export type InvertObject<O extends Record<PropertyKey, PropertyKey>> = {
  [K in O[keyof O]]: {
    [Key in keyof O]: O[Key] extends K ? Key : never
  }[keyof O]
}

export const invertObject = <const O extends Record<PropertyKey, PropertyKey>>(o: O): InvertObject<O> =>
  Object.fromEntries(
    Object.entries(o).map(([k, v]) => [v, k])
  ) as InvertObject<O>


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

export const concatenateStreams = async <T extends any>(streams: ReadonlyArray<ReadableStream<T>>) => {
  const { readable, writable } = new TransformStream<T, T>()

  for (let i = 0; i < streams.length; i++)
    await streams[i].pipeTo(writable, { preventClose: i + 1 !== streams.length })

  return readable
}

export const originLock = async (name: string, options: LockOptions = {}) => {
  const { promise: lockAquiredPromise,  resolve: lockAquired } = Promise.withResolvers<void>()
  const { promise: lockReleasedPromise, resolve: releaseLock } = Promise.withResolvers<void>()

  try {
    navigator.locks.request(name, options, () => {
      lockAquired()
      return lockReleasedPromise
    })
  } catch {}

  await lockAquiredPromise

  return () => {
    releaseLock()
  }
}

export const range = (from: number, to: number, stepSize = 1) => {
  const sign = Math.sign(to - from)
  if (sign === 0)
    return []

  const result: number[] = []
  for (let n = from; n < to; n += sign * stepSize)
    result.push(n)
  return result
}

export const randomId = () =>
  Math.random().toString(36).slice(2)

export const basicLatin = String.fromCharCode(...range(32, 127))

export const makeRandomPassword = ({
  length = 32,
  characters = basicLatin
}: {
  /** Max 256 */
  length?: number,
  characters?: string | ReadonlyArray<string>
} = {}) => {
  const entropyPerCharacter = 8
  const statesPerCharacter = 2 ** entropyPerCharacter

  if (characters.length > statesPerCharacter)
    throw new Error(`Character count (${characters.length}) must not exceed 2^8 (256)`)

  const limit = statesPerCharacter - (statesPerCharacter % characters.length)

  const randomValuesUnderLimit: number[] = []
  while (randomValuesUnderLimit.length < length) {
    const randomValues = crypto.getRandomValues(
      new Uint8Array(length - randomValuesUnderLimit.length)
    )
    for (const randomValue of randomValues)
      if (randomValue < limit)
        randomValuesUnderLimit.push(randomValue)
  }

  let result = ""
  for (const n of randomValuesUnderLimit)
    result += characters[n % characters.length]
  return result
}

export const hash = async (
  data: string | BufferSource,
  algorithm: AlgorithmIdentifier = "SHA-256"
) => {
  if (typeof data === "string")
    data = new TextEncoder().encode(data)

  const bytes = new Uint8Array(
    await crypto.subtle.digest(algorithm, data)
  )

  let result = ""
  for (const byte of bytes)
    result += byte.toString(16).padStart(2, "0")
  return result
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions#escaping
 */
export const regexEscape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

export const regexTag = (
	strings: TemplateStringsArray,
	...substitutions: ReadonlyArray<unknown>
) => {
	let result = ""
	for (let i = 0; i < strings.length; i++)
		result += strings.raw[i] + regexEscape((substitutions[i] ?? "") + "")
	return (flags?: string) => new RegExp(result, flags)
}

export const urlTag = (strings: TemplateStringsArray, ...substitutions: ReadonlyArray<unknown>) => {
	let result = ""
	for (let i = 0; i < strings.length; i++)
		result += strings[i] + encodeURIComponent((substitutions[i] ?? "") + "")
	return result
}

type UrlParts = {
	pathname: string
	search: string
	hash: string
}
export const modifyUrl = (url: URL | string, f: (parts: UrlParts) => Partial<UrlParts>) => {
	try {
		const result = new URL(url)
		Object.assign(result, f(result))
		return result.href
	} catch {}

	const match = (url as string).match(/(.*?)(\?[^#\n]*)?(#.*)?$/m)
	if (!match)
    return url as string

	const [, pathname = "", search = "", hash = ""] = match

	const inputParts = { pathname, search, hash }
	const parts = { ...inputParts, ...f(inputParts) }
	return (
		parts.pathname +
		(parts.search ? "?" + parts.search.replace(/^\?/m, "") : "") +
		(parts.hash ? "#" + encodeURIComponent(parts.hash.replace(/^#/m, "")) : "")
	)
}

export const urlWithParams = (
	url: URL | string,
	searchParameters?: Record<string, LikelyAsString | ReadonlyArray<LikelyAsString> | undefined>
) =>
	modifyUrl(url, ({ search }) => {
		const searchParams = new URLSearchParams(search)

		for (const key in searchParameters) {
			searchParams.delete(key)
			const valueOrValues = searchParameters[key]
			if (valueOrValues === undefined) continue

			if (Array.isArray(valueOrValues))
				for (const value of valueOrValues as ReadonlyArray<LikelyAsString>)
					searchParams.append(key, value + "")
			else
        searchParams.append(key, (valueOrValues as LikelyAsString) + "")
		}
		searchParams.sort()

		return { search: searchParams.toString() }
	})

export class NodeTreeIterator implements IterableIterator<Node> {
  #root: ParentNode
  #current: Node
  #filter?: (node: Node) => boolean

  constructor(root: ParentNode, filter?: (node: Node) => boolean) {
    this.#current = this.#root = root
    this.#filter = filter
  }

  #isSkipping = false
  /** Skip descendents of the current node */
  skip() {
    this.#isSkipping = true
  }

  #next() {
    let current = this.#current
    while (true) {
      const isSkipping = this.#isSkipping
      this.#isSkipping = false

      if (!isSkipping && current.firstChild) {
        current = current.firstChild
      }
      else if (current.nextSibling) {
        if (current === this.#root)
          return

        current = current.nextSibling
      }
      else {
        while (true) {
          if (!current.parentNode || current === this.#root)
            return

          const parent = current.parentNode
          if (parent === this.#root)
            return

          if (parent.nextSibling) {
            current = parent.nextSibling
            break
          }
          else {
            current = parent
          }
        }
      }

      if (!this.#filter || this.#filter(current))
        return this.#current = current
    }
  }

  next() {
    const value = this.#next()
    return { done: !value, value } as
      | { done: false, value: Node }
      | { done: true,  value: undefined }
  }

  [Symbol.iterator]() {
    return this
  }
}

export const makeFlatRange = (firstNode: ChildNode, isLastNode: (node: ChildNode) => boolean) => {
	const range = firstNode.ownerDocument!.createRange()

	range.setStartBefore(firstNode)

	let lastNode: ChildNode
	for (
		let currentNode: ChildNode | null = firstNode;
		(currentNode = currentNode.nextSibling);
		currentNode
	) {
		if (isLastNode(currentNode)) {
			lastNode = currentNode
			break
		}
	}
	lastNode ??= firstNode.parentNode!.lastChild!

	range.setEndAfter(lastNode)

	return range
}

type SearchPath = ReadonlyArray<{
  parent: {},
  key: PropertyKey,
  value: unknown
}>

export const recursivelySearchFor = <T extends unknown>(
	x: unknown,
	f: (value: unknown) => value is T,
	path: SearchPath = []
): ReadonlyArray<{ path: SearchPath, value: T }> => {
	if (f(x)) return [{ path, value: x }]

	if (Array.isArray(x))
		return x.flatMap((y, i) =>
			recursivelySearchFor(y, f, [...path, { parent: x, key: i, value: y }])
		)

	if (x !== null && typeof x === "object")
		return Object.entries(x).flatMap(([k, v]) =>
			recursivelySearchFor(v, f, [...path, { parent: x, key: k, value: v }])
		)

	return []
}

// https://tc39.es/ecma262/multipage/executable-code-and-execution-contexts.html#sec-canbeheldweakly
export const canBeHeldWeakly = (x: unknown): x is WeakKey =>
  (typeof x === "object" && x !== null)
  || typeof x === "function"
  || (typeof x === "symbol" && Symbol.keyFor(x) === undefined)

type ScopeNode<T = unknown> = {
  value?: T,
  weakChildren?: WeakMap<WeakKey, ScopeNode<T>>,
  children?: Map<unknown, ScopeNode<T>>
}

/**
 * A cache that supports nested scope paths with mixed weak/strong segments.
 * Object/function segments use WeakMap (GC-able), primitives use Map.
 */
export class NestedCache {
  #root: ScopeNode = {}

  #getOrCreateNode(path: ReadonlyArray<unknown>): ScopeNode {
    let node = this.#root
    for (const segment of path) {
      if (canBeHeldWeakly(segment)) {
        node.weakChildren ??= new WeakMap()
        let child = node.weakChildren.get(segment)
        if (!child)
          node.weakChildren.set(segment, child = {})
        node = child
      }
      else {
        node.children ??= new Map()
        let child = node.children.get(segment)
        if (!child)
          node.children.set(segment, child = {})
        node = child
      }
    }
    return node
  }

  get<T>(path: ReadonlyArray<unknown>, compute: () => T) {
    const node = this.#getOrCreateNode(path)
    if (!Object.hasOwn(node, "value"))
      node.value = compute()
    return node.value as T
  }
}

const memoCache = new NestedCache()

export const memo = <
  In  extends unknown,
  Out extends unknown
>(
  f: (x: In) => Out,
  {
    scope = [f],
    getKey
  }: {
    /**
     * Defaults to [f]. Use e.g. [globalThis] to never GC memoized inputs and outputs.
     */
    scope?: ReadonlyArray<unknown>,
    /**
     * Defaults to the input itself
     */
    getKey?: (x: In) => unknown
  } = {}
) => (x: In) =>
  memoCache.get(
    [...scope, getKey ? getKey(x) : x],
    () => f(x)
  )
