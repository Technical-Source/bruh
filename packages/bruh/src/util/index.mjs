import { r } from "../reactive/index.mjs"

// Create a pipeline with an initial value and a series of functions
export const pipe = (x, ...fs) =>
  fs.reduce((y, f) => f(y), x)

// Dispatch a custom event to (capturing) and from (bubbling) a target (usually a DOM node)
// Returns false if the event was cancelled (preventDefault()) and true otherwise
// Note that this is synchronous
export const dispatch = (type, detail, target, options) =>
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

// Inspired by https://antfu.me/posts/destructuring-with-object-or-array#take-away
// Creates an object that is both destructable with {...} and [...]
// Useful for writing library functions à la react-use & vueuse
export const createDestructable = (object, iterable) => {
  const destructable = {
    ...object,
    [Symbol.iterator]: () => iterable[Symbol.iterator]()
  }

  Object.defineProperty(destructable, Symbol.iterator, {
    enumerable: false
  })

  return destructable
}

// Creates an object (as a Proxy) that acts as a function
// So functionAsObject(f).property is equivalent to f("property")
// This is can be useful when combined with destructuring syntax, e.g.:
// const { html, head, title, body, main, h1, p } = functionAsObject(e)
export const functionAsObject = f =>
  new Proxy({}, {
    get: (_, property) => f(property)
  })

export const mapObject = (o, f) =>
  Object.fromEntries(
    Object.entries(o).map(f)
  )

export const invertObject = o =>
  mapObject(o, ([key, value]) => [value, key])

export const camelToDashCase = s =>
  s.replace(/[A-Z]/g, c => "-" + c.toLowerCase())

export const dashToCamelCase = s =>
  s.replace(/-[a-z]/g, dc => dc[1].toUpperCase())

export const unique = (values, getKey) => {
  if (!getKey)
    return [...new Set(values)]

  const seen = new Map()
  for (const value of values) {
    const key = getKey(value)
    if (!seen.has(key))
      seen.set(key, value)
  }
  return [...seen.values()]
}

const report = e => {
  console.error(e)
}
export const attempt = (f, recover = report) => {
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

export const currentUrl = r()
const reflectUrl = () => {
  currentUrl.value = new URL(location.href)
}
reflectUrl()
addEventListener("hashchange", reflectUrl)
if ("navigation" in window)
  navigation.addEventListener("navigate", reflectUrl)
else {
  const replacedPushState = history.pushState
  const replacedReplaceState = history.replaceState
  history.pushState = function() {
    const result = replacedPushState.apply(this, arguments)
    reflectUrl()
    return result
  }
  history.replaceState = function() {
    const result = replacedReplaceState.apply(this, arguments)
    reflectUrl()
    return result
  }
}
