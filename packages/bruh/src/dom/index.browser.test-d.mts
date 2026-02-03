import { describe, test, expectTypeOf, assertType } from "vitest"
import type {
  BruhChild,
  TerminalBruhChild,
  BruhProps,
  StylesToApply,
  ClassesToApply,
  AttributesToApply
} from "./index.browser.mts"
import type { MaybeReactive } from "../reactive/index.mts"

describe("Browser DOM Types", () => {
  test("BruhProps accepts valid HTML attributes", () => {
    assertType<BruhProps<"div">>({ id: "test" })
    assertType<BruhProps<"div">>({ class: "foo" })
    assertType<BruhProps<"input">>({ type: "text", value: "hello" })
    assertType<BruhProps<"a">>({ href: "https://example.com", target: "_blank" })
  })

  test("BruhProps accepts event listeners", () => {
    assertType<BruhProps<"button">>({ onclick: (e) => {} })
    assertType<BruhProps<"input">>({ oninput: (e) => {} })
    assertType<BruhProps<"div">>({ onmouseover: (e) => {} })
  })

  test("BruhProps accepts style object", () => {
    assertType<BruhProps<"div">>({ style: { color: "red" } })
    assertType<BruhProps<"div">>({ style: { "font-size": "16px" } })
  })

  test("BruhProps accepts class object", () => {
    assertType<BruhProps<"div">>({ class: { active: true, disabled: false } })
  })

  test("BruhProps accepts children", () => {
    assertType<BruhProps<"div">>({ children: "text" })
    assertType<BruhProps<"div">>({ children: ["a", "b", "c"] })
  })

  test("BruhProps requires namespace for SVG", () => {
    assertType<BruhProps<"path", "http://www.w3.org/2000/svg">>({
      bruh: { namespace: "http://www.w3.org/2000/svg" }
    })
  })

  test("BruhProps requires namespace for MathML", () => {
    assertType<BruhProps<"math", "http://www.w3.org/1998/Math/MathML">>({
      bruh: { namespace: "http://www.w3.org/1998/Math/MathML" }
    })
  })

  test("BruhChild accepts valid terminal types", () => {
    assertType<BruhChild>("string")
    assertType<BruhChild>(42)
    assertType<BruhChild>(null)
    assertType<BruhChild>(undefined)
    assertType<BruhChild>(true)
    assertType<BruhChild>(false)
  })

  test("BruhChild accepts nested iterables", () => {
    assertType<BruhChild>(["nested", ["deeply", "nested"]])
    assertType<BruhChild>(["a", "b", "c"])
  })

  test("TerminalBruhChild types", () => {
    assertType<TerminalBruhChild>("string")
    assertType<TerminalBruhChild>(42)
    assertType<TerminalBruhChild>(null)
    assertType<TerminalBruhChild>(undefined)
    assertType<TerminalBruhChild>(true)
  })

  test("StylesToApply accepts CSS properties with optional absent values", () => {
    const styles: StylesToApply = {
      color: "red",
      "font-size": "16px"
    }
    assertType<StylesToApply>(styles)

    const stylesWithNull: StylesToApply = {
      color: null,
      display: undefined
    }
    assertType<StylesToApply>(stylesWithNull)
  })

  test("ClassesToApply accepts boolean values", () => {
    const classes: ClassesToApply = {
      active: true,
      disabled: false
    }
    assertType<ClassesToApply>(classes)

    const classesWithNull: ClassesToApply = {
      active: null,
      disabled: undefined
    }
    assertType<ClassesToApply>(classesWithNull)
  })

  test("AttributesToApply accepts element-specific attributes", () => {
    const attrs: AttributesToApply<"input"> = {
      type: "text",
      value: "hello",
      disabled: true
    }
    assertType<AttributesToApply<"input">>(attrs)
  })

  test("AttributesToApply accepts boolean for toggle attributes", () => {
    const attrs: AttributesToApply<"input"> = {
      disabled: true,
      readonly: false
    }
    assertType<AttributesToApply<"input">>(attrs)
  })
})
