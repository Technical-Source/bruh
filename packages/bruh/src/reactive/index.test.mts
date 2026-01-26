import { describe, expect, vi } from "vitest"
import { test, fc } from "@fast-check/vitest"
import {
  isReactiveSymbol,
  isReactive,
  SimpleReactive,
  FunctionalReactive,
  r,
  reactiveDo,
  flat
} from "./index.mts"

describe("Reactive", () => {
  describe("isReactive symbol", () => {
    test("SimpleReactive", () => {
      expect(new SimpleReactive(undefined)[isReactiveSymbol]).toBeTruthy()
    })

    test("FunctionalReactive", () => {
      expect(new FunctionalReactive(undefined)[isReactiveSymbol]).toBeTruthy()
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
      const reactive = new SimpleReactive<typeof symbol | undefined>(undefined)
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
      const reactive = new SimpleReactive<typeof symbol | undefined>(undefined)
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
      const reactive = new SimpleReactive<Symbol | undefined>(undefined)
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
        const reactive = new SimpleReactive<number | undefined>(undefined)
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
        const reactive = r<number>()
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
      const source = r()
      let notThrowing = true
      const derivative = r([source], () => {
        if (notThrowing)
          return source.value

        throw source.value
      })
      const reaction = vi.fn(() => {
        expect(derivative.value).toBe(notThrowing ? source.value : undefined)
      })
      derivative.addReaction(reaction)

      expect(derivative.value).toBe(source.value)
      expect(reaction).not.toHaveBeenCalled()

      source.value = Symbol()
      FunctionalReactive.applyUpdates()
      expect(reaction).toHaveBeenCalledTimes(1)

      notThrowing = false
      source.value = Symbol()
      FunctionalReactive.applyUpdates()
      expect(reaction).toHaveBeenCalledTimes(2)
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

  describe("isEqual (property-based)", () => {
    const isEqualParity = (a: number, b: number) => (a & 1) === (b & 1)

    test.prop([
      fc.integer({ min: -1000, max: 1000 }),
      fc.array(fc.integer({ min: -1000, max: 1000 }), { minLength: 1, maxLength: 20 })
    ])("reactions only fire when equivalence class changes", (initial, updates) => {
      const s = r(initial, { isEqual: isEqualParity })
      const spy = vi.fn()
      const stopReacting = s.addReaction(spy)

      let modelCommitted = initial
      let expectedReactions = 0

      for (const next of updates) {
        s.value = next
        FunctionalReactive.applyUpdates()

        if (!isEqualParity(next, modelCommitted)) {
          modelCommitted = next
          expectedReactions++
        }
        expect(s.value).toBe(modelCommitted)
      }

      expect(spy).toHaveBeenCalledTimes(expectedReactions)
      stopReacting()
    })

    test.prop([
      fc.integer({ min: -1000, max: 1000 }),
      fc.array(fc.integer({ min: -1000, max: 1000 }), { minLength: 1, maxLength: 20 })
    ])("derivatives respect source isEqual", (initial, updates) => {
      const s = r(initial, { isEqual: isEqualParity })
      const d = r([s], () => s.value * 2)
      const spy = vi.fn()
      const stopReacting = d.addReaction(spy)

      let modelCommitted = initial
      let expectedReactions = 0

      for (const next of updates) {
        s.value = next
        FunctionalReactive.applyUpdates()

        if (!isEqualParity(next, modelCommitted)) {
          modelCommitted = next
          expectedReactions++
        }
        expect(d.value).toBe(modelCommitted * 2)
      }

      expect(spy).toHaveBeenCalledTimes(expectedReactions)
      stopReacting()
    })

    test.prop([
      fc.integer({ min: -1000, max: 1000 }),
      fc.integer({ min: -1000, max: 1000 })
    ])("pending equal value cancels queued update", (initial, different) => {
      const adjusted = isEqualParity(initial, different) ? different + 1 : different
      const s = r(initial, { isEqual: isEqualParity })
      const spy = vi.fn()
      const stopReacting = s.addReaction(spy)

      s.value = adjusted
      s.value = initial + 2

      FunctionalReactive.applyUpdates()

      expect(spy).not.toHaveBeenCalled()
      stopReacting()
    })

    test.prop([
      fc.array(fc.integer({ min: -1000, max: 1000 }), { minLength: 2, maxLength: 10 })
    ])("batching: last write wins, reactions fire at most once per flush", (values) => {
      const s = r(values[0])
      const spy = vi.fn()
      const stopReacting = s.addReaction(spy)

      for (const v of values.slice(1)) {
        s.value = v
      }
      FunctionalReactive.applyUpdates()

      const finalValue = values[values.length - 1]
      expect(s.value).toBe(finalValue)
      expect(spy.mock.calls.length).toBeLessThanOrEqual(1)
      stopReacting()
    })
  })

  describe("flat()", () => {
    test("initial value is correct", () => {
      const inner = r(42)
      const outer = r(inner)
      const flattened = flat<number>(outer)

      expect(flattened.value).toBe(42)
    })

    test("updates when inner value changes", () => {
      const inner = r(1)
      const outer = r(inner)
      const flattened = flat<number>(outer)

      inner.value = 99
      FunctionalReactive.applyUpdates()
      expect(flattened.value).toBe(99)
    })

    test("detached inner reactives stop affecting output", () => {
      const innerA = r(1)
      const innerB = r(2)
      const outer = r<typeof innerA | typeof innerB>(innerA)
      const flattened = flat<number>(outer)

      expect(flattened.value).toBe(1)

      outer.value = innerB
      FunctionalReactive.applyUpdates()
      expect(flattened.value).toBe(2)

      innerA.value = 999
      FunctionalReactive.applyUpdates()
      expect(flattened.value).toBe(2)

      innerB.value = 42
      FunctionalReactive.applyUpdates()
      expect(flattened.value).toBe(42)
    })

    test("isEqual is copied from innermost", () => {
      const isEqualParity = (a: number, b: number) => (a & 1) === (b & 1)
      const inner = r(0, { isEqual: isEqualParity })
      const outer = r(inner)
      const flattened = flat<number>(outer)

      expect(flattened.isEqual).toBe(isEqualParity)
    })

    test("isEqual updates when innermost changes", () => {
      const isEqualA = (a: number, b: number) => a === b
      const isEqualB = (a: number, b: number) => (a & 1) === (b & 1)
      const innerA = r(0, { isEqual: isEqualA })
      const innerB = r(0, { isEqual: isEqualB })
      const outer = r<typeof innerA | typeof innerB>(innerA)
      const flattened = flat<number>(outer)

      expect(flattened.isEqual).toBe(isEqualA)

      outer.value = innerB
      FunctionalReactive.applyUpdates()
      expect(flattened.isEqual).toBe(isEqualB)
    })

    test("deeply nested reactives", () => {
      const level3 = r(100)
      const level2 = r(level3)
      const level1 = r(level2)
      const flattened = flat<number>(level1)

      expect(flattened.value).toBe(100)

      level3.value = 200
      FunctionalReactive.applyUpdates()
      expect(flattened.value).toBe(200)
    })

    test("reactions fire on flattened value change", () => {
      const inner = r(1)
      const outer = r(inner)
      const flattened = flat<number>(outer)
      const spy = vi.fn()
      flattened.addReaction(spy)

      inner.value = 2
      FunctionalReactive.applyUpdates()

      expect(spy).toHaveBeenCalledOnce()
      expect(flattened.value).toBe(2)
    })

    test.prop([
      fc.integer({ min: 1, max: 5 }),
      fc.array(fc.oneof(
        fc.constant("mutate-inner" as const),
        fc.constant("switch-branch" as const)
      ), { minLength: 1, maxLength: 10 })
    ])("model-based: flattened value matches manual traversal", (depth, ops) => {
      const createNested = (d: number, val: number): any => {
        if (d === 0) return r(val)
        return r(createNested(d - 1, val))
      }

      const branchA = createNested(depth, 1)
      const branchB = createNested(depth, 2)
      const root = r(branchA)
      const flattened = flat<number>(root)

      let currentBranch = branchA
      let expectedValue = 1

      const getInnermost = (node: any): any => {
        while (isReactive(node.value)) node = node.value
        return node
      }

      for (const op of ops) {
        if (op === "mutate-inner") {
          const innermost = getInnermost(currentBranch)
          innermost.value++
          expectedValue = innermost.value
        } else {
          currentBranch = currentBranch === branchA ? branchB : branchA
          root.value = currentBranch
          expectedValue = getInnermost(currentBranch).value
        }
        FunctionalReactive.applyUpdates()
        expect(flattened.value).toBe(expectedValue)
      }
    })
  })
})
