// Create a pipeline with an initial value and a series of functions
export const pipe = (x, ...fs) =>
  fs.reduce((y, f) => f(y), x)

export { toAsyncIterable, listen } from "./iterable/async.mjs"
