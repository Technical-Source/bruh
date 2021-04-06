// Turn an iterable into an array
export const toArray = Array.from

// Simply consume the iterable without caring
// about the values. Useful for effects.
export const run = iterable => {
  for (const x of iterable) {}
}

// Run a function for each value of an iterable
export const forEach = f =>
  iterable => {
    for (const x of iterable)
      f(x)
  }

// Like forEach, but returns passes each value along
// This is useful for effects like console.log in the middle of a pipeline
export const tap = f =>
  function*(iterable) {
    for (const x of iterable)
      f(x), yield x
  }

// Slice an iterable from [start, end) - [inclusive, exclusive)
// This is just like Array.prototype.slice() but without negative index support
export const slice = (start, end) =>
  function*(iterable) {
    let i = 0
    for (const x of iterable) {
      if (start <= i && i < end)
        yield x

      i++

      if (end <= i)
        return
    }
  }

// Make an iterable with each value having a function applied to it
export const map = f =>
  function*(iterable) {
    for (const x of iterable)
      yield f(x)
  }

// Make an iterable with only values satisfying a given predicate
export const filter = f =>
  function*(iterable) {
    for (const x of iterable)
      if (f(x))
        yield x
  }

// Reduce an iterable with a function f(accumulator, currentValue)
// and an initial value
export const reduce = (f, initial) =>
  iterable => {
    let accumulator = initial
    for (const x of iterable)
      accumulator = f(accumulator, x)
    return accumulator
  }

// Concatenate iterables (not merge/interleave)
export const concat = (...tail) =>
  function*(head) {
    for (const x of head)
      yield x
    for (const iterable of tail)
      for (const x of iterable)
        yield x
  }

// Make an iterable of arrays of values from the same index
// that has a function applied to it
export const zipWith = f =>
  function*(iterables) {
    const iterators = iterables.map(x => x[Symbol.iterator]())
    while (true) {
      const current = iterators.map(x => x.next())
      if (current.some(x => x.done))
        return
      yield f(...current.map(x => x.value))
    }
  }

// Make an iterable of arrays of values from the same index
export const zip = zipWith((...xs) => xs)
