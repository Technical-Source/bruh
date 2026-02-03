/**
 * Was unsupported in safari until spring 2021
 */
export const weakRefPolyfill = () => {
  if (globalThis.WeakRef) return

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
