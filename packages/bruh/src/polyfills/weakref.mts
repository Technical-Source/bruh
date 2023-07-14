// was unsupported in safari until spring 2021
if (!globalThis.WeakRef) {
  const weakRefToObject = new WeakMap<WeakRefPolyfill<object>, object>()

  class WeakRefPolyfill<T extends object> {
    constructor(object: T) {
      weakRefToObject.set(this, object)
    }

    deref(): T | undefined {
      return weakRefToObject.get(this) as T
    }
  }

  globalThis.WeakRef = WeakRefPolyfill as WeakRefConstructor
}
