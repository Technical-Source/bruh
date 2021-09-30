const isReactive = Symbol.for("bruh reactive")

// A super simple and performant reactive value implementation
export class SimpleReactive {
  [isReactive] = true

  #value
  #reactions = new Set()

  constructor(value) {
    this.#value = value
  }

  get value() {
    return this.#value
  }

  set value(newValue) {
    if (newValue === this.#value)
      return

    this.#value = newValue
    for (const reaction of this.#reactions)
      reaction()
  }

  addReaction(reaction) {
    this.#reactions.add(reaction)

    return () =>
      this.#reactions.delete(reaction)
  }
}

// A reactive implementation for building functional reactive graphs
// Ensures state consistency, minimal node updates, and transparent update batching
export class FunctionalReactive {
  [isReactive] = true

  #value
  #reactions = new Set()

  // For derived nodes, f is the derivation function
  #f
  // Source nodes are 0 deep in the derivation graph
  // This is for topological sort
  #depth = 0
  // All nodes have a set of derivatives that update when the node changes
  #derivatives = new Set()

  // Keep track of all the pending changes from the value setter
  static #pendingUpdates = new Map()
  // A queue of derivatives to potentially update, sorted into sets by depth
  // This starts with depth 1 and can potentially have holes
  static #derivativesQueue = []

  constructor(x, f) {
    if (!f) {
      this.#value = x
      return
    }

    this.#value = f()
    this.#f = f
    this.#depth = Math.max(...x.map(d => d.#depth)) + 1

    x.forEach(d => d.#derivatives.add(this))
  }

  get value() {
    // If there are any pending updates, go ahead and apply them first
    // It's ok that there's already a microtask queued for this
    if (FunctionalReactive.#pendingUpdates.size)
      FunctionalReactive.applyUpdates()

    return this.#value
  }

  set value(newValue) {
    // Only allow souce nodes to be directly updated
    if (this.#depth !== 0)
      return

    // Unless asked for earlier, these updates are just queued up until the microtasks run
    if (!FunctionalReactive.#pendingUpdates.size)
      queueMicrotask(FunctionalReactive.applyUpdates)

    FunctionalReactive.#pendingUpdates.set(this, newValue)
  }

  addReaction(reaction) {
    this.#reactions.add(reaction)

    return () =>
      this.#reactions.delete(reaction)
  }

  // Apply an update for a node and queue its derivatives if it actually changed
  #applyUpdate(newValue) {
    if (newValue === this.#value)
      return

    this.#value = newValue
    for (const reaction of this.#reactions)
      reaction(newValue)

    const queue = FunctionalReactive.#derivativesQueue
    for (const derivative of this.#derivatives) {
      const depth = derivative.#depth
      if (!queue[depth])
        queue[depth] = new Set()

      queue[depth].add(derivative)
    }
  }

  // Apply pending updates from actually changed source nodes
  static applyUpdates() {
    if (!FunctionalReactive.#pendingUpdates.size)
      return

    // Bootstrap by applying the updates from the pending source node updates
    for (const [sourceNode, newValue] of FunctionalReactive.#pendingUpdates.entries())
      sourceNode.#applyUpdate(newValue)

    FunctionalReactive.#pendingUpdates.clear()

    // Iterate down the depths, ignoring holes
    // Note that both the queue (Array) and each depth Set iterators update as items are added
    for (const depthSet of FunctionalReactive.#derivativesQueue) if (depthSet)
      for (const derivative of depthSet)
        derivative.#applyUpdate(derivative.#f())

    FunctionalReactive.#derivativesQueue.length = 0
  }
}

// A little convenience function
export const r = (x, f) => new FunctionalReactive(x, f)

// Do something with a value, updating if it is reactive
export const reactiveDo = (x, f) => {
  if (x?.[isReactive]) {
    f(x.value)
    return x.addReaction(() => f(x.value))
  }

  f(x)
}
