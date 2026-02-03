import { describe, expect, vi, afterEach } from "vitest"
import { test, fc } from "@fast-check/vitest"
import {
  flush,
  Reactive,
  r,
  reactiveDo,
  flat,
  watch,
  untrack
} from "./index.mts"

afterEach(() => {
  flush()
})

type Expr =
  | { type: "source", index: number }
  | { type: "const", value: number }
  | { type: "add", left: Expr, right: Expr }
  | { type: "mul", left: Expr, right: Expr }
  | { type: "neg", inner: Expr }

const exprArb = (sourceCount: number): fc.Arbitrary<Expr> =>
  fc.letrec(tie => ({
    expr: fc.oneof(
      { maxDepth: 3 },
      fc.integer({ min: 0, max: sourceCount - 1 }).map(i => ({ type: "source" as const, index: i })),
      fc.integer({ min: -100, max: 100 }).map(v => ({ type: "const" as const, value: v })),
      fc.record({ type: fc.constant("add" as const), left: tie("expr"), right: tie("expr") }),
      fc.record({ type: fc.constant("mul" as const), left: tie("expr"), right: tie("expr") }),
      fc.record({ type: fc.constant("neg" as const), inner: tie("expr") })
    )
  })).expr as fc.Arbitrary<Expr>

const evalExpr = (expr: Expr, sources: number[]): number => {
  switch (expr.type) {
    case "source": return sources[expr.index]!
    case "const": return expr.value
    case "add": return evalExpr(expr.left, sources) + evalExpr(expr.right, sources)
    case "mul": return evalExpr(expr.left, sources) * evalExpr(expr.right, sources)
    case "neg": return -evalExpr(expr.inner, sources)
  }
}

const evalExprReactive = (expr: Expr, sources: Reactive<number>[]): number => {
  switch (expr.type) {
    case "source": return sources[expr.index]!.value
    case "const": return expr.value
    case "add": return evalExprReactive(expr.left, sources) + evalExprReactive(expr.right, sources)
    case "mul": return evalExprReactive(expr.left, sources) * evalExprReactive(expr.right, sources)
    case "neg": return -evalExprReactive(expr.inner, sources)
  }
}

describe("Reactive", () => {
  describe("referential transparency", () => {
    test.prop([
      fc.integer({ min: 1, max: 5 }).chain(sourceCount =>
        fc.tuple(
          fc.array(fc.integer({ min: -100, max: 100 }), { minLength: sourceCount, maxLength: sourceCount }),
          exprArb(sourceCount)
        )
      )
    ])("derived equals pure evaluation of getter", ([initials, expr]) => {
      const sources = initials.map(v => r(v))

      const derived = r(() => evalExprReactive(expr, sources))

      expect(derived.peek()).toBe(evalExpr(expr, sources.map(s => s.value)))
    })

    test.prop([
      fc.array(fc.integer({ min: -100, max: 100 }), { minLength: 2, maxLength: 5 }).chain(initials =>
        fc.tuple(
          fc.constant(initials),
          exprArb(initials.length),
          fc.array(
            fc.record({
              index: fc.nat(),
              value: fc.integer({ min: -100, max: 100 })
            }),
            { minLength: 1, maxLength: 20 }
          )
        )
      )
    ])("derived stays consistent after random updates", ([initials, expr, updates]) => {
      const sources = initials.map(v => r(v))
      const derived = r(() => evalExprReactive(expr, sources))

      for (const { index, value } of updates) {
        sources[index % sources.length]!.value = value
        const actual = derived.peek()
        const expected = evalExpr(expr, sources.map(s => s.value))
        expect(Object.is(actual, expected) || (actual === 0 && expected === 0)).toBe(true)
      }
    })
  })

  describe("no spurious recomputes", () => {
    test.prop([
      fc.integer()
    ])("setting same value does not trigger effect", async (value) => {
      const source = r(value)
      let runs = 0
      watch(() => { source.value; runs++ })

      flush()
      expect(runs).toBe(1)

      source.value = value
      flush()
      expect(runs).toBe(1)
    })

    test("NaN equality: setting NaN to NaN does not trigger", async () => {
      const source = r(NaN)
      let runs = 0
      watch(() => { source.value; runs++ })

      flush()
      expect(runs).toBe(1)

      source.value = NaN
      flush()
      expect(runs).toBe(1)
    })

    test("-0 and +0 are equal (SameValueZero)", async () => {
      const source = r(0)
      let runs = 0
      watch(() => { source.value; runs++ })

      flush()
      expect(runs).toBe(1)

      source.value = -0
      flush()
      expect(runs).toBe(1)
    })

    test("custom isEqual always-true prevents all propagation", async () => {
      const source = r(0, { isEqual: () => true })
      let runs = 0
      watch(() => { source.value; runs++ })

      flush()
      expect(runs).toBe(1)

      source.value = 999
      flush()
      expect(runs).toBe(1)
    })

    test("custom isEqual always-false triggers on every write", async () => {
      const source = r(0, { isEqual: () => false })
      let runs = 0
      watch(() => { source.value; runs++ })

      flush()
      expect(runs).toBe(1)

      source.value = 0
      flush()
      expect(runs).toBe(2)

      source.value = 0
      flush()
      expect(runs).toBe(3)
    })
  })

  describe("glitch-free diamond propagation", () => {
    test("diamond: effect sees only stable values", async () => {
      const s = r(0)
      const d1 = r(() => s.value + 1)
      const d2 = r(() => s.value + 10)
      const d3 = r(() => d1.value + d2.value)

      const log: number[] = []
      watch(() => { log.push(d3.value) })

      flush()
      expect(log).toEqual([11])

      s.value = 5
      flush()
      expect(log).toEqual([11, 21])
      expect(d3.value).toBe(5 + 1 + 5 + 10)
    })

    test.prop([
      fc.array(fc.integer({ min: 0, max: 100 }), { minLength: 1, maxLength: 10 })
    ])("diamond: N synchronous writes produce one effect run", async (values) => {
      const s = r(0)
      const d1 = r(() => s.value + 1)
      const d2 = r(() => s.value + 10)
      const d3 = r(() => d1.value + d2.value)

      let runs = 0
      watch(() => { d3.value; runs++ })

      flush()
      expect(runs).toBe(1)

      for (const v of values)
        s.value = v

      flush()
      const finalValue = values.at(-1)!
      expect(d3.value).toBe(finalValue + 1 + finalValue + 10)
      if (finalValue !== 0)
        expect(runs).toBe(2)
    })
  })

  describe("dynamic dependency tracking", () => {
    test("branch switch: inactive source does not trigger", async () => {
      const a = r(1)
      const b = r(2)
      const cond = r(true)
      const derived = r(() => cond.value ? a.value : b.value)

      let runs = 0
      watch(() => { derived.value; runs++ })

      flush()
      expect(runs).toBe(1)
      expect(derived.value).toBe(1)

      b.value = 999
      flush()
      expect(runs).toBe(1)

      cond.value = false
      flush()
      expect(runs).toBe(2)
      expect(derived.value).toBe(999)

      a.value = 888
      flush()
      expect(runs).toBe(2)
    })

    test.prop([
      fc.array(
        fc.oneof(
          fc.record({ type: fc.constant("setA" as const), value: fc.integer() }),
          fc.record({ type: fc.constant("setB" as const), value: fc.integer() }),
          fc.constant({ type: "toggle" as const })
        ),
        { minLength: 1, maxLength: 30 }
      )
    ])("branch switching: derived always matches active branch", async (ops) => {
      const a = r(0)
      const b = r(0)
      let cond = true
      const condR = r(cond)
      const derived = r(() => condR.value ? a.value : b.value)

      flush()

      for (const op of ops) {
        if (op.type === "setA") a.value = op.value
        else if (op.type === "setB") b.value = op.value
        else { cond = !cond; condR.value = cond }

        flush()
        expect(derived.value).toBe(cond ? a.value : b.value)
      }
    })
  })

  describe("untrack", () => {
    test("reads inside untrack do not establish dependencies", async () => {
      const tracked = r(0)
      const untracked_ = r(0)

      let runs = 0
      watch(() => {
        tracked.value
        untrack(() => untracked_.value)
        runs++
      })

      flush()
      expect(runs).toBe(1)

      untracked_.value = 999
      flush()
      expect(runs).toBe(1)

      tracked.value = 1
      flush()
      expect(runs).toBe(2)
    })

    test("explicit deps mode: only listed deps trigger", async () => {
      const dep = r(0)
      const ignored = r(0)

      let runs = 0
      watch([dep], () => {
        ignored.value
        runs++
      })

      flush()
      expect(runs).toBe(1)

      ignored.value = 999
      flush()
      expect(runs).toBe(1)

      dep.value = 1
      flush()
      expect(runs).toBe(2)
    })

    test("derived explicit deps: only listed deps trigger recompute", () => {
      const dep = r(1)
      const ignored = r(100)

      let computeCount = 0
      const derived = r([dep], () => {
        computeCount++
        return dep.value + ignored.value
      })

      expect(derived.value).toBe(101)
      expect(computeCount).toBe(1)

      ignored.value = 200
      expect(derived.value).toBe(101)
      expect(computeCount).toBe(1)

      dep.value = 2
      expect(derived.value).toBe(202)
      expect(computeCount).toBe(2)
    })
  })

  describe("microtask batching", () => {
    test.prop([
      fc.integer({ min: 2, max: 50 })
    ])("N synchronous writes = 1 effect run", async (n) => {
      const source = r(0)
      let runs = 0
      watch(() => { source.value; runs++ })

      flush()
      expect(runs).toBe(1)

      for (let i = 1; i <= n; i++)
        source.value = i

      expect(runs).toBe(1)

      flush()
      expect(runs).toBe(2)
      expect(source.value).toBe(n)
    })

    test("separate batches cause separate runs", async () => {
      const source = r(0)
      let runs = 0
      watch(() => { source.value; runs++ })

      flush()
      expect(runs).toBe(1)

      source.value = 1
      flush()
      expect(runs).toBe(2)

      source.value = 2
      flush()
      expect(runs).toBe(3)
    })
  })

  describe("cleanup semantics", () => {
    test("cleanup called before each rerun", async () => {
      const source = r(0)
      let cleanups = 0

      watch(() => {
        source.value
        return () => { cleanups++ }
      })

      flush()
      expect(cleanups).toBe(0)

      source.value = 1
      flush()
      expect(cleanups).toBe(1)

      source.value = 2
      flush()
      expect(cleanups).toBe(2)
    })

    test("cleanup called on dispose", async () => {
      const source = r(0)
      let cleanups = 0

      const stop = watch(() => {
        source.value
        return () => { cleanups++ }
      })

      flush()
      expect(cleanups).toBe(0)

      stop()
      expect(cleanups).toBe(1)
    })

    test("no reactions after dispose", async () => {
      const source = r(0)
      let runs = 0
      let cleanups = 0

      const stop = watch(() => {
        source.value
        runs++
        return () => { cleanups++ }
      })

      flush()
      expect(runs).toBe(1)
      expect(cleanups).toBe(0)

      stop()
      expect(cleanups).toBe(1)

      source.value = 999
      flush()
      expect(runs).toBe(1)
      expect(cleanups).toBe(1)
    })

    test.prop([
      fc.array(
        fc.oneof(
          fc.constant("update" as const),
          fc.constant("flush" as const)
        ),
        { minLength: 1, maxLength: 20 }
      )
    ])("cleanup count matches rerun count", async (ops) => {
      const source = r(0)
      let runs = 0
      let cleanups = 0

      const stop = watch(() => {
        source.value
        runs++
        return () => { cleanups++ }
      })

      flush()
      expect(runs).toBe(1)

      let pendingUpdate = false
      for (const op of ops) {
        if (op === "update") {
          source.value++
          pendingUpdate = true
        } else {
          flush()
          pendingUpdate = false
        }
      }

      if (pendingUpdate) flush()

      expect(cleanups).toBe(runs - 1)

      stop()
      expect(cleanups).toBe(runs)
    })
  })

  describe("cycle detection", () => {
    test("recompute during compute triggers cycle error", () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {})

      const source = r(0)
      let derived: Reactive<number>
      derived = r(() => {
        const val = source.value
        if (val > 0) {
          source.value = val + 1
          return derived.value
        }
        return val
      })

      expect(derived.value).toBe(0)

      source.value = 1
      derived.value

      expect(errorSpy).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringMatching(/Cycle detected/)
      }))
      errorSpy.mockRestore()
    })
  })

  describe("effect-caused writes converge", () => {
    test.prop([
      fc.integer({ min: 1, max: 20 })
    ])("effect incrementing source converges", async (target) => {
      const source = r(0)

      watch(() => {
        if (source.value < target)
          source.value++
      })

      flush()
      expect(source.value).toBe(target)
    })

    test("cascading effects settle in single flush", async () => {
      const a = r(0)
      const b = r(0)
      const c = r(0)

      watch(() => { if (a.value > b.value) b.value = a.value })
      watch(() => { if (b.value > c.value) c.value = b.value })

      flush()
      expect([a.value, b.value, c.value]).toEqual([0, 0, 0])

      a.value = 5
      flush()
      expect([a.value, b.value, c.value]).toEqual([5, 5, 5])
    })
  })

  describe("flat", () => {
    test("returns innermost value", () => {
      const inner = r(42)
      const outer = r(inner)
      expect(flat<number>(outer).value).toBe(42)
    })

    test("caching: same input returns same instance", () => {
      const inner = r(42)
      const outer = r(inner)
      expect(flat<number>(outer)).toBe(flat<number>(outer))
    })

    test("tracks updates through nesting", () => {
      const inner = r(1)
      const outer = r(inner)
      const flattened = flat<number>(outer)

      expect(flattened.value).toBe(1)
      inner.value = 99
      expect(flattened.value).toBe(99)
    })

    test("tracks outer switches", () => {
      const a = r(1)
      const b = r(2)
      const outer = r<Reactive<number>>(a)
      const flattened = flat<number>(outer)

      expect(flattened.value).toBe(1)
      outer.value = b
      expect(flattened.value).toBe(2)

      a.value = 999
      expect(flattened.value).toBe(2)
    })

    test.prop([
      fc.integer({ min: 1, max: 5 }),
      fc.array(
        fc.oneof(
          fc.constant("mutate" as const),
          fc.constant("switch" as const)
        ),
        { minLength: 1, maxLength: 15 }
      )
    ])("flattened matches manual traversal", (depth, ops) => {
      const createNested = (d: number, val: number): Reactive<any> =>
        d === 0 ? r(val) : r(createNested(d - 1, val))

      const getInnermost = (node: Reactive<any>): Reactive<number> => {
        while (node.value instanceof Reactive) node = node.value
        return node
      }

      const branchA = createNested(depth, 1)
      const branchB = createNested(depth, 2)
      const root = r(branchA)
      const flattened = flat<number>(root)

      let current = branchA

      for (const op of ops) {
        if (op === "mutate") {
          getInnermost(current).value++
        } else {
          current = current === branchA ? branchB : branchA
          root.value = current
        }

        expect(flattened.value).toBe(getInnermost(current).value)
      }
    })
  })

  describe("reactiveDo", () => {
    test("non-reactive: calls f once, returns undefined", () => {
      const spy = vi.fn()
      const result = reactiveDo(42, spy)

      expect(result).toBeUndefined()
      expect(spy).toHaveBeenCalledOnce()
      expect(spy).toHaveBeenCalledWith(42)
    })

    test("reactive: reacts to changes, stop works", async () => {
      const source = r(1)
      const spy = vi.fn()
      const stop = reactiveDo(source, spy)

      flush()
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenLastCalledWith(1)

      source.value = 2
      flush()
      expect(spy).toHaveBeenCalledTimes(2)
      expect(spy).toHaveBeenLastCalledWith(2)

      stop!()
      source.value = 3
      flush()
      expect(spy).toHaveBeenCalledTimes(2)
    })
  })

  describe("readonly derivations", () => {
    test("throws on write", () => {
      const derived = r(() => 42)
      expect(() => { (derived as any).value = 5 }).toThrow(/readonly/)
    })
  })

  describe("context", () => {
    test("isTracking reflects current state", async () => {
      expect(Reactive.context.isTracking).toBe(false)

      let insideTracking = false
      watch(() => {
        insideTracking = Reactive.context.isTracking
      })

      flush()
      expect(insideTracking).toBe(true)
    })

    test("stackDepth increases with nesting", () => {
      let outerDepth = -1
      let innerDepth = -1

      r(() => {
        outerDepth = Reactive.context.stackDepth
        r(() => {
          innerDepth = Reactive.context.stackDepth
          return 0
        }).value
        return 0
      }).value

      expect(innerDepth).toBeGreaterThan(outerDepth)
    })
  })

  describe("untrack", () => {
    test("reads inside untrack do not become dependencies", async () => {
      const source = r(0)
      let runs = 0
      watch(() => {
        untrack(() => source.value)
        runs++
      })
      flush()
      expect(runs).toBe(1)

      source.value = 1
      flush()
      expect(runs).toBe(1) // should NOT have rerun
    })

    test("derived using untrack does not track those reads", async () => {
      const source = r(0)
      const derived = r(() => untrack(() => source.value) + 1)

      let runs = 0
      watch(() => { derived.value; runs++ })
      flush()
      expect(runs).toBe(1)
      expect(derived.value).toBe(1)

      source.value = 5
      flush()
      expect(runs).toBe(1) // derived didn't recompute
      expect(derived.value).toBe(1) // still stale
    })
  })

  describe("peek non-tracking", () => {
    test("peek does not track access", async () => {
      const source = r(0)
      let runs = 0
      watch(() => {
        source.peek()
        runs++
      })
      flush()
      expect(runs).toBe(1)

      source.value = 1
      flush()
      expect(runs).toBe(1) // should NOT have rerun
    })
  })

  describe("explicit dependency mode", () => {
    describe("watch with explicit deps", () => {
      test("callback is untracked; only explicit deps trigger", async () => {
        const a = r(0)
        const b = r(0)
        let runs = 0
        const stop = watch([a], () => {
          b.value // would be dependency if tracked
          runs++
        })
        flush()
        expect(runs).toBe(1)

        b.value++
        flush()
        expect(runs).toBe(1) // b is not tracked

        a.value++
        flush()
        expect(runs).toBe(2)
        stop()
      })

      test("deps getter is untracked", async () => {
        const selector = r(true)
        const a = r(0)
        const b = r(0)
        let runs = 0
        const stop = watch(
          () => selector.value ? [a] : [b],
          () => { runs++ }
        )
        flush()
        expect(runs).toBe(1)

        // deps getter runs inside untrack, so selector is NOT a dependency
        selector.value = false
        flush()
        expect(runs).toBe(1) // no rerun

        // a is still the only tracked dep (from initial run)
        a.value++
        flush()
        expect(runs).toBe(2)

        // now deps getter reruns and picks up b as dep
        // but selector change alone doesn't trigger
        b.value++
        flush()
        expect(runs).toBe(3) // b is now tracked
        stop()
      })

      test("skipFirst skips initial run but subscribes", async () => {
        const a = r(0)
        let runs = 0
        const stop = watch([a], () => { runs++ }, { skipFirst: true })
        flush()
        expect(runs).toBe(0)

        a.value++
        flush()
        expect(runs).toBe(1)
        stop()
      })
    })

    describe("r with explicit deps", () => {
      test("getter is untracked; only explicit deps trigger recompute", async () => {
        const a = r(1)
        const b = r(10)
        const derived = r([a], () => a.peek() + b.value)

        expect(derived.value).toBe(11)

        b.value = 20
        expect(derived.value).toBe(11) // b not tracked

        a.value = 2
        expect(derived.value).toBe(22) // a triggered recompute, now sees b=20
      })

      test("deps getter version", async () => {
        const selector = r(true)
        const a = r(1)
        const b = r(2)
        const derived = r(
          () => selector.peek() ? [a] : [b],
          () => selector.peek() ? a.peek() : b.peek()
        )

        expect(derived.value).toBe(1)

        selector.value = false
        // selector change alone won't trigger since deps getter uses peek
        expect(derived.value).toBe(1)

        // Force recompute via a (still tracked from initial deps)
        a.value = 10
        expect(derived.value).toBe(2) // now uses b since selector is false
      })
    })
  })

  describe("memoKey", () => {
    test("memoKey prevents recompute when key unchanged", async () => {
      const source = r(0)
      let computes = 0
      const derived = r(
        () => { computes++; return source.value * 2 },
        { memoKey: () => Math.floor(source.value / 10) }
      )

      expect(derived.value).toBe(0)
      expect(computes).toBe(1)

      source.value = 1
      expect(derived.value).toBe(0) // memoKey still 0, skipped recompute
      expect(computes).toBe(1)

      source.value = 10
      expect(derived.value).toBe(20) // memoKey changed to 1
      expect(computes).toBe(2)

      source.value = 15
      expect(derived.value).toBe(20) // memoKey still 1
      expect(computes).toBe(2)
    })

    test("memoKey uses SameValueZero for comparison", async () => {
      const source = r(0)
      let computes = 0
      const derived = r(
        () => { computes++; return source.value },
        { memoKey: () => NaN }
      )

      expect(derived.value).toBe(0)
      expect(computes).toBe(1)

      source.value = 1
      expect(derived.value).toBe(0) // NaN === NaN with SameValueZero
      expect(computes).toBe(1)
    })
  })

  describe("derived isEqual", () => {
    test("derived isEqual prevents value update but observers still rerun", async () => {
      const source = r(0)
      const derived = r(
        () => source.value % 2,
        { isEqual: (a, b) => a === b }
      )

      let runs = 0
      watch(() => { derived.value; runs++ })
      flush()
      expect(runs).toBe(1)

      source.value = 2 // 2 % 2 = 0, same as before
      flush()
      // observers still rerun because derived was marked dirty
      expect(runs).toBe(2)
      // but the derived value stays the same
      expect(derived.value).toBe(0)

      source.value = 3 // 3 % 2 = 1, different
      flush()
      expect(runs).toBe(3)
      expect(derived.value).toBe(1)
    })

    test("derived isEqual always-true keeps initial undefined", async () => {
      const source = r(0)
      const derived = r(() => source.value, { isEqual: () => true })

      // initial value is undefined because isEqual(() => true) prevents even first assignment
      expect(derived.value).toBe(undefined)

      source.value = 999
      // value is still undefined because isEqual prevents any update
      expect(derived.value).toBe(undefined)
    })
  })

  describe("error handling", () => {
    test("derived getter throwing logs error and keeps previous value", async () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
      const source = r(0)
      const derived = r(() => {
        if (source.value > 0) throw new Error("boom")
        return source.value
      })

      expect(derived.value).toBe(0)

      source.value = 1
      expect(derived.value).toBe(0) // keeps previous value
      expect(errorSpy).toHaveBeenCalled()
      errorSpy.mockRestore()
    })

    test("effect cleanup throwing does not break flush", async () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
      const source = r(0)
      const ran: string[] = []

      watch(() => {
        source.value
        ran.push("A")
        return () => { throw new Error("cleanup fail") }
      })
      watch(() => { source.value; ran.push("B") })

      flush()
      expect(ran).toEqual(["A", "B"])

      source.value++
      flush()
      expect(ran).toContain("A")
      expect(ran).toContain("B")
      expect(ran.filter(x => x === "B").length).toBe(2) // B still ran
      errorSpy.mockRestore()
    })
  })

  describe("dispose behavior", () => {
    test("disposed effect does not run on pending flush", async () => {
      const source = r(0)
      let runs = 0
      const stop = watch(() => { source.value; runs++ })
      flush()
      expect(runs).toBe(1)

      source.value++
      stop() // dispose before flush
      flush()
      expect(runs).toBe(1) // should not have run
    })

    test("dispose is idempotent", async () => {
      const source = r(0)
      let cleanups = 0
      const stop = watch(() => {
        source.value
        return () => { cleanups++ }
      })
      flush()

      stop()
      stop()
      stop()
      expect(cleanups).toBe(1)
    })
  })

  describe("flush reentrancy", () => {
    test("calling flush inside effect does not infinite loop", async () => {
      const source = r(0)
      let runs = 0
      watch(() => {
        source.value
        runs++
        if (runs < 3) flush() // nested flush
      })
      flush()
      expect(runs).toBeLessThan(100) // didn't infinite loop
    })
  })
})
