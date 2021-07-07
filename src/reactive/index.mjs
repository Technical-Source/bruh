export class Reactive {
  constructor(value) {
    this.isBruhReactive = true

    this._value = value
    this._reactors = new Set()
  }

  get value() {
    return this._value
  }

  set value(newValue) {
    if (newValue === this._value)
      return

    this._value = newValue
    this.wasUpdated()

    return newValue
  }

  wasUpdated() {
    for (const reactor of this._reactors)
      reactor()
  }

  react(reactor) {
    this._reactors.add(reactor)

    return () =>
      this._reactors.delete(reactor)
  }
}

export const r = (x, f) => {
  if (typeof f === "function") {
    const derived = new Reactive(f())
    const update = () => {
      derived.value = f()
    }

    for (const dependency of x)
      dependency.react(update)

    return derived
  }

  return new Reactive(x)
}
