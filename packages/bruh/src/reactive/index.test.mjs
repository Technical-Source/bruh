import { describe, test, expect, vi } from "vitest"
import {
  isReactive,
  SimpleReactive,
  FunctionalReactive,
  r,
  reactiveDo
} from "./index.mjs"

describe("Reactive", () => {
  describe("isReactive symbol", () => {
    test("SimpleReactive", () => {
      expect(new SimpleReactive()[isReactive]).toBeTruthy()
    })

    test("FunctionalReactive", () => {
      expect(new FunctionalReactive()[isReactive]).toBeTruthy()
    })
  })

  describe("make and read", () => {
    test("simple", () => {
      const symbol = Symbol()
      const reactive = new SimpleReactive(symbol)
      expect(reactive.value).toBe(symbol)
    })

    test("source", () => {
      const symbol = Symbol()
      const reactive = r(symbol)
      expect(reactive.value).toBe(symbol)
    })

    test("derivative of 1", () => {
      const source = r(1)
      const derivative = r([source], () => source.value + 1)
      expect(derivative.value).toBe(source.value + 1)
    })

    test("derivative of 2", () => {
      const a = r(1)
      const b = r(1)
      const derivative = r([a, b], () => a.value + b.value)
      expect(derivative.value).toBe(a.value + b.value)
    })
  })

  describe("update and read", () => {
    test("simple", () => {
      const symbol = Symbol()
      const reactive = new SimpleReactive()
      reactive.value = symbol
      expect(reactive.value).toBe(symbol)
    })

    test("source", () => {
      const symbol = Symbol()
      const reactive = r()
      reactive.value = symbol
      expect(reactive.value).toBe(symbol)
    })

    test("derivative of 1", () => {
      const source = r(1)
      const derivative = r([source], () => source.value + 1)
      for (let i = 0; i < 2; i++) {
        expect(derivative.value).toBe(source.value + 1)
        source.value++
        expect(derivative.value).toBe(source.value + 1)
      }
    })

    test("derivative of 2", () => {
      const a = r(1)
      const b = r(1)
      const derivative = r([a, b], () => a.value + b.value)
      for (let i = 0; i < 2; i++) {
        expect(derivative.value).toBe(a.value + b.value)
        a.value++
        expect(derivative.value).toBe(a.value + b.value)
        b.value++
        expect(derivative.value).toBe(a.value + b.value)
      }
    })
  })

  describe("update and react", () => {
    test("simple", () => {
      const symbol = Symbol()
      const reactive = new SimpleReactive()
      const reaction = vi.fn(() => {
        expect(reactive.value).toBe(symbol)
      })
      reactive.addReaction(reaction)

      reactive.value = symbol
      reactive.value = symbol
      expect(reaction).toHaveBeenCalledOnce()
    })

    describe("calling FunctionalReactive.applyUpdates()", () => {
      test("source", () => {
        const symbol = Symbol()
        const reactive = r()
        const reaction = vi.fn(() => {
          expect(reactive.value).toBe(symbol)
        })
        reactive.addReaction(reaction)

        reactive.value = symbol
        reactive.value
        expect(reaction).not.toHaveBeenCalled()

        FunctionalReactive.applyUpdates()
        reactive.value = symbol
        FunctionalReactive.applyUpdates()
        expect(reaction).toHaveBeenCalledOnce()
      })

      test("derivative of 1", () => {
        const source = r(1)
        const derivative = r([source], () => source.value + 1)
        const reaction = vi.fn(() => {
          expect(derivative.value).toBe(source.value + 1)
        })
        derivative.addReaction(reaction)

        for (let i = 0; i < 2; i++) {
          derivative.value++
          source.value++
          source.value
          expect(reaction).toHaveBeenCalledTimes(i)

          FunctionalReactive.applyUpdates()
          source.value = source.value
          FunctionalReactive.applyUpdates()
          expect(reaction).toHaveBeenCalledTimes(i + 1)
        }
      })

      test("derivative of 2", () => {
        const a = r(1)
        const b = r(1)
        const derivative = r([a, b], () => a.value + b.value)
        const reaction = vi.fn(() => {
          expect(derivative.value).toBe(a.value + b.value)
        })
        derivative.addReaction(reaction)

        for (let i = 0; i < 2; i++) {
          derivative.value++
          a.value++
          b.value++
          a.value
          b.value
          expect(reaction).toHaveBeenCalledTimes(i)

          FunctionalReactive.applyUpdates()
          a.value++
          b.value--
          FunctionalReactive.applyUpdates()
          expect(reaction).toHaveBeenCalledTimes(i + 1)
        }
      })
    })

    describe("await / as microtask", () => {
      test("source", async () => {
        const symbol = Symbol()
        const reactive = r()
        const reaction = vi.fn(() => {
          expect(reactive.value).toBe(symbol)
        })
        reactive.addReaction(reaction)

        reactive.value = symbol
        reactive.value
        expect(reaction).not.toHaveBeenCalled()

        await Promise.resolve()
        expect(reaction).toHaveBeenCalledOnce()
      })

      test("derivative of 1", async () => {
        const source = r(1)
        const derivative = r([source], () => source.value + 1)
        const reaction = vi.fn(() => {
          expect(derivative.value).toBe(source.value + 1)
        })
        derivative.addReaction(reaction)

        for (let i = 0; i < 2; i++) {
          source.value++
          source.value
          expect(reaction).toHaveBeenCalledTimes(i)

          await Promise.resolve()
          expect(reaction).toHaveBeenCalledTimes(i + 1)
        }
      })

      test("derivative of 2", async () => {
        const a = r(1)
        const b = r(1)
        const derivative = r([a, b], () => a.value + b.value)
        const reaction = vi.fn(() => {
          expect(derivative.value).toBe(a.value + b.value)
        })
        derivative.addReaction(reaction)

        for (let i = 0; i < 2; i++) {
          a.value++
          b.value++
          a.value
          b.value
          expect(reaction).toHaveBeenCalledTimes(i)

          await Promise.resolve()
          expect(reaction).toHaveBeenCalledTimes(i + 1)
        }
      })
    })

    describe("reading derivative", () => {
      test("derivative of 1", () => {
        const source = r(1)
        const derivative = r([source], () => source.value + 1)
        const reaction = vi.fn(() => {
          expect(derivative.value).toBe(source.value + 1)
        })
        derivative.addReaction(reaction)

        for (let i = 0; i < 2; i++) {
          source.value++
          derivative.value
          expect(reaction).toHaveBeenCalledTimes(i + 1)
        }
      })

      test("derivative of 2", () => {
        const a = r(1)
        const b = r(1)
        const derivative = r([a, b], () => a.value + b.value)
        const reaction = vi.fn(() => {
          expect(derivative.value).toBe(a.value + b.value)
        })
        derivative.addReaction(reaction)

        for (let i = 0; i < 2; i++) {
          a.value++
          b.value++
          derivative.value
          expect(reaction).toHaveBeenCalledTimes(i + 1)
        }
      })
    })
  })

  describe("remove reaction", () => {
    test("simple", () => {
      const symbol = Symbol()
      const reactive = new SimpleReactive()
      const reaction = vi.fn(() => {
        expect(reactive.value).toBe(symbol)
      })
      const removeReaction = reactive.addReaction(reaction)

      reactive.value = symbol
      expect(reaction).toHaveBeenCalledOnce()

      removeReaction()
      reactive.value = Symbol()
      expect(reaction).toHaveBeenCalledOnce()
    })

    describe("calling FunctionalReactive.applyUpdates()", () => {
      test("source", () => {
        const symbol = Symbol()
        const reactive = r()
        const reaction = vi.fn(() => {
          expect(reactive.value).toBe(symbol)
        })
        const removeReaction = reactive.addReaction(reaction)

        reactive.value = symbol
        reactive.value
        expect(reaction).not.toHaveBeenCalled()

        FunctionalReactive.applyUpdates()
        expect(reaction).toHaveBeenCalledOnce()

        removeReaction()
        reactive.value = Symbol()
        FunctionalReactive.applyUpdates()
        expect(reaction).toHaveBeenCalledOnce()
      })

      test("derivative of 1", () => {
        const source = r(1)
        const derivative = r([source], () => source.value + 1)
        const reaction = vi.fn(() => {
          expect(derivative.value).toBe(source.value + 1)
        })
        const removeReaction = derivative.addReaction(reaction)

        source.value++
        source.value
        expect(reaction).not.toHaveBeenCalled()

        FunctionalReactive.applyUpdates()
        expect(reaction).toHaveBeenCalledOnce()

        removeReaction()
        source.value++
        FunctionalReactive.applyUpdates()
        expect(reaction).toHaveBeenCalledOnce()
      })

      test("derivative of 2", () => {
        const a = r(1)
        const b = r(1)
        const derivative = r([a, b], () => a.value + b.value)
        const reaction = vi.fn(() => {
          expect(derivative.value).toBe(a.value + b.value)
        })
        const removeReaction = derivative.addReaction(reaction)

        a.value++
        b.value++
        a.value
        b.value
        expect(reaction).not.toHaveBeenCalled()

        FunctionalReactive.applyUpdates()
        expect(reaction).toHaveBeenCalledOnce()

        removeReaction()
        a.value++
        b.value++
        FunctionalReactive.applyUpdates()
        expect(reaction).toHaveBeenCalledOnce()
      })
    })
  })

  describe("catches exceptions", () => {
    describe("throwing reaction", () => {
      test("simple", () => {
        const reactive = new SimpleReactive()
        const reaction1 = vi.fn(() => {
          throw undefined
        })
        const reaction2 = vi.fn(() => {
          throw undefined
        })
        reactive.addReaction(reaction1)
        reactive.addReaction(reaction2)

        reactive.value = 1
        reactive.value++

        expect(reactive.value).toBe(2)
        expect(reaction1).toHaveBeenCalledTimes(2)
        expect(reaction2).toHaveBeenCalledTimes(2)
      })

      test("functional", () => {
        const reactive = r()
        const reaction1 = vi.fn(() => {
          throw undefined
        })
        const reaction2 = vi.fn(() => {
          throw undefined
        })
        reactive.addReaction(reaction1)
        reactive.addReaction(reaction2)

        reactive.value = 1
        FunctionalReactive.applyUpdates()
        reactive.value++
        FunctionalReactive.applyUpdates()

        expect(reactive.value).toBe(2)
        expect(reaction1).toHaveBeenCalledTimes(2)
        expect(reaction2).toHaveBeenCalledTimes(2)
      })
    })

    test("throwing derivation function", () => {
      const symbol = Symbol()
      const source = r()
      const derivative = r([source], () => {
        throw source.value
      })
      const reaction = vi.fn(() => {
        expect(derivative.value).toBe(source.value)
      })
      derivative.addReaction(reaction)

      expect(derivative.value).toBe(undefined)
      expect(reaction).not.toHaveBeenCalled()

      source.value = symbol
      FunctionalReactive.applyUpdates()
      expect(reaction).toHaveBeenCalledOnce()
    })
  })

  describe("reactiveDo", () => {
    test("nonreactive", () => {
      const symbol = Symbol()
      const reaction = vi.fn(x => {
        expect(x).toBe(symbol)
      })

      const removeReaction = reactiveDo(symbol, reaction)
      expect(removeReaction).toBeUndefined()
      expect(reaction).toHaveBeenCalledOnce()
      expect(reaction).toHaveBeenLastCalledWith(symbol)
    })

    test("reactive", () => {
      const reactive = r(Symbol())
      const reaction = vi.fn(() => {})

      const removeReaction = reactiveDo(reactive, reaction)
      expect(reaction).toHaveBeenCalledOnce()
      expect(reaction).toHaveBeenLastCalledWith(reactive.value)

      reactive.value = Symbol()
      FunctionalReactive.applyUpdates()
      expect(reaction).toHaveBeenCalledTimes(2)
      expect(reaction).toHaveBeenLastCalledWith(reactive.value)

      removeReaction()
      reactive.value = Symbol()
      FunctionalReactive.applyUpdates()
      expect(reaction).toHaveBeenCalledTimes(2)
      expect(reaction).not.toHaveBeenLastCalledWith(reactive.value)
    })
  })
})
