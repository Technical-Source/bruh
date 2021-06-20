// Create a pipeline with an initial value and a series of functions
export const pipe = (x, ...fs) =>
  fs.reduce((y, f) => f(y), x)

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
