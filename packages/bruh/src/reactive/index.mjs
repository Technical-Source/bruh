const isReactive = Symbol.for("bruh reactive")

export class Reactive {
  #value
  #reactors

  constructor(value) {
    this[isReactive] = true

    this.#value = value
    this.#reactors = new Set()
  }

  get value() {
    return this.#value
  }

  set value(newValue) {
    if (newValue === this.#value)
      return

    this.#value = newValue
    this.wasUpdated()

    return newValue
  }

  wasUpdated() {
    for (const reactor of this.#reactors)
      reactor()
  }

  react(reactor) {
    this.#reactors.add(reactor)

    return () =>
      this.#reactors.delete(reactor)
  }
}

export const r = (xOrDependencies, f) => {
  // If no function f is specified, make a node for x
  if (!f)
    return new Reactive(xOrDependencies)

  // If there is a function, make a node that depends on other nodes
  const derived = new Reactive(f())

  const update = () =>
    derived.value = f()
  for (const dependency of xOrDependencies)
    dependency.react(update)

  return derived
}

export const reactiveDo = (x, f) => {
  if (x[isReactive])
    x.react(() => f(x.value))
  else
    f(x)
}
