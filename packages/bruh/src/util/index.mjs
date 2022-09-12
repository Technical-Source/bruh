// Create a pipeline with an initial value and a series of functions
export const pipe = (x, ...fs) =>
  fs.reduce((y, f) => f(y), x)

// Dispatch a custom event to (capturing) and from (bubbling) a target (usually a DOM node)
// Returns false if the event was cancelled (preventDefault()) and true otherwise
// Note that this is synchronous
export const dispatch = (target, type, options) =>
  target.dispatchEvent(
    // Default to behave like most DOM events
    new CustomEvent(type, {
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
