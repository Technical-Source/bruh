// This takes a callback accepting function and returns an async iterable
export const toAsyncIterable = callbackAcceptor => {
  // Keeps track of if this has stopped yet
  let resolveStopped
  const stopped = new Promise(resolve => {
    resolveStopped = resolve
  })
  // The value queue holds all values as they wait to be resolved on .next()
  const valueQueue = []
  // The resolver queue holds Promise resolve functions when .next() is called
  // and there are no values to be resolved yet
  const resolverQueue = []

  // Either resolves with the waiting Promise resolve function
  // or queues the value
  const pushValue = async x => {
    if (resolverQueue.length)
      resolverQueue.shift()(x)
    else
      valueQueue.push(x)
  }

  // Either resolves the waiting value
  // or queues the Promise resolve function
  const pullValue = async () =>
    new Promise(resolve => {
      if (valueQueue.length)
        resolve(valueQueue.shift())
      else
        resolverQueue.push(resolve)
    })

  // Hook in by setting the callback to pushValue()
  // Also, the callback acceptor might return a function to run to stop it
  const onStop = callbackAcceptor(pushValue)

  // Return an object that is both an async iterable and an async iterator
  return {
    // This property makes this an async iterable,
    // and its async iterator is set to itself
    [Symbol.asyncIterator]() {
      return this
    },

    // This property makes this an async iterator
    async next() {
      const resolveToValue = async () => {
        const value = await pullValue()
        return { value }
      }

      if (valueQueue.length)
        return resolveToValue()

      const resolveToDone = async () => {
        await stopped
        return { done: true }
      }

      return Promise.race([
        resolveToValue(),
        resolveToDone()
      ])
    },

    // Expose the function to allow pushing values directly to the value queue
    push: pushValue,

    // Allow the async iterator to be stopped
    stop() {
      resolveStopped()

      if (onStop)
        return onStop()
    }
  }
}

// Make an async iterable of DOM events
export const listen = (target, event) =>
  toAsyncIterable(resolve => {
    target.addEventListener(event, resolve)

    return () =>
      target.removeEventListener(event, resolve)
  })

// Turn an async iterable into an array
export const toArray = async iterable => {
  const array = []
  for await (const x of iterable)
    array.push(x)
  return array
}

// Simply consume the async iterable without caring
// about the values. Useful for effects.
export const run = async iterable => {
  for await (const x of iterable) {}
}

// Run a function for each value of an async iterable
export const forEach = f =>
  async iterable => {
    for await (const x of iterable)
      f(x)
  }

// Like forEach, but returns passes each value along
// This is useful for effects like console.log in the middle of a pipeline
export const tap = f =>
  async function*(iterable) {
    for await (const x of iterable)
      f(x), yield x
  }

// Slice an async iterable from [start, end) - [inclusive, exclusive)
// This is just like Array.prototype.slice() but without negative index support
export const slice = (start, end) =>
  async function*(iterable) {
    let i = 0
    for await (const x of iterable) {
      if (start <= i && i < end)
        yield x

      i++

      if (end <= i)
        return
    }
  }

// Make an async iterable with each value having a function applied to it
export const map = f =>
  async function*(iterable) {
    for await (const x of iterable)
      yield f(x)
  }

// Make an async iterable with only values satisfying a given predicate
export const filter = f =>
  async function*(iterable) {
    for await (const x of iterable)
      if (f(x))
        yield x
  }

// Reduce an async iterable with a function f(accumulator, currentValue)
// and an initial value
export const reduce = (f, initial) =>
  async iterable => {
    let accumulator = initial
    for await (const x of iterable)
      accumulator = f(accumulator, x)
    return accumulator
  }

// Concatenate async iterables (not merge/interleave)
export const concat = (...tail) =>
  async function*(head) {
    for await (const x of head)
      yield x
    for (const iterable of tail)
      for await (const x of iterable)
        yield x
  }

// Make an async iterable of arrays of values from the same index
// that has a function applied to it
export const zipWith = f =>
  async function*(iterables) {
    const iterators = iterables.map(x => x[Symbol.asyncIterator]())
    while (true) {
      const current = await Promise.all(iterators.map(x => x.next()))
      if (current.some(x => x.done))
        return
      yield f(...current.map(x => x.value))
    }
  }

// Make an async iterable of arrays of values from the same index
export const zip = zipWith((...xs) => xs)
