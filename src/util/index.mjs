// Create a pipeline with an initial value and a series of functions
export const pipe = (x, ...fs) =>
  fs.reduce((y, f) => f(y), x)

// Super simple, small, performant, and safe id source
// It just returns base36 (0-9 then a-z) natural numbers, incrementing on each call
let n = 0
export const id = () =>
  (n++).toString(36)

// Dispatch a custom event to (capturing) and from (bubbling) a target (usually a DOM node)
// Returns false if the event was cancelled (preventDefault()) and true otherwise
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
