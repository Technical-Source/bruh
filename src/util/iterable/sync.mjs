// Turn an iterable into an array
export const toArray = Array.from

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
