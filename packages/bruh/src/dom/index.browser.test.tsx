/** @jsxImportSource bruh/browser */
import { describe, test, expect, vi, afterEach } from "vitest"
import { fc, test as fcTest } from "@fast-check/vitest"
import { flush, r, Reactive } from "../reactive/index.mts"
import {
  jsx,
  Fragment,
  t,
  applyStyles,
  applyClasses,
  applyAttributes,
  ownedReactivesSymbol,
  BruhText
} from "./index.browser.mts"

declare global {
  interface HTMLElementEventMap {
    whatever: CustomEvent<{ lol: "test" }>
  }
}

class HTMLBruhElementElement extends HTMLElement {
  constructor() {
    super()
  }
}
customElements.define("bruh-element", HTMLBruhElementElement)

declare global {
  interface HTMLElementTagNameMap {
    "bruh-element": HTMLBruhElementElement
  }
}

interface HTMLBruhElementEventMap extends HTMLElementEventMap {
  bruhmoment: CustomEvent<{ bruh: true }>
}

declare module "html-info" {
  interface HTMLTagToEventMap {
    "bruh-element": HTMLBruhElementEventMap
  }
}
declare module "csstype" {
  interface PropertiesHyphen {
    "--custom"?: "red" | "green" | "blue"
  }
}

<bruh-element onbruhmoment={e => e.detail.bruh} />

const x =
  <>
    <video
      onpointerdown={e => {
        console.log(e.isPrimary)
      }}
    ></video>

    <a onwhatever={({ detail }) => detail.lol === "test"}></a>

    <bruh-element
      bruh={{
        namespace: "http://www.w3.org/1999/xhtml"
      }}
      onbruhmoment={e => console.log("bruh", e.detail.bruh)}
      style={{
        "width": "fit-content",
        "accent-color": r("royalblue"),
        "--custom": "blue"
      }}
    />
  </>

afterEach(() => {
  flush()
  document.body.replaceChildren()
  ;(BruhText as any).hydrated = {}
})

describe("Terminal Child to Node Coercion", () => {
  test("existing Node is returned as-is", () => {
    const div = document.createElement("div")
    const text = document.createTextNode("hello")
    const comment = document.createComment("comment")

    const c1 = <div>{div}</div> as HTMLDivElement
    const c2 = <div>{text}</div> as HTMLDivElement
    const c3 = <div>{comment}</div> as HTMLDivElement
    expect(c1.firstChild).toBe(div)
    expect(c2.firstChild).toBe(text)
    expect(c3.firstChild).toBe(comment)
  })

  test("null becomes Comment node", () => {
    const container = <div>{null}</div> as HTMLDivElement
    expect(container.firstChild).toBeInstanceOf(Comment)
    expect((container.firstChild as Comment).data).toBe("null")
  })

  test("undefined becomes Comment node", () => {
    const container = <div>{undefined}</div> as HTMLDivElement
    expect(container.firstChild).toBeInstanceOf(Comment)
    expect((container.firstChild as Comment).data).toBe("undefined")
  })

  test("true becomes Comment node", () => {
    const container = <div>{true}</div> as HTMLDivElement
    expect(container.firstChild).toBeInstanceOf(Comment)
    expect((container.firstChild as Comment).data).toBe("true")
  })

  test("false becomes Comment node", () => {
    const container = <div>{false}</div> as HTMLDivElement
    expect(container.firstChild).toBeInstanceOf(Comment)
    expect((container.firstChild as Comment).data).toBe("false")
  })

  test("string becomes Text node", () => {
    const container = <div>hello</div> as HTMLDivElement
    expect(container.firstChild).toBeInstanceOf(Text)
    expect(container.firstChild!.textContent).toBe("hello")
  })

  test("empty string becomes Text node", () => {
    const container = <div>{""}</div> as HTMLDivElement
    expect(container.firstChild).toBeInstanceOf(Text)
    expect(container.firstChild!.textContent).toBe("")
  })

  test("number becomes Text node", () => {
    const container = <div>{42}</div> as HTMLDivElement
    expect(container.firstChild).toBeInstanceOf(Text)
    expect(container.firstChild!.textContent).toBe("42")
  })

  test("0 becomes Text node", () => {
    const container = <div>{0}</div> as HTMLDivElement
    expect(container.firstChild).toBeInstanceOf(Text)
    expect(container.firstChild!.textContent).toBe("0")
  })

  test("NaN becomes Text node", () => {
    const container = <div>{NaN}</div> as HTMLDivElement
    expect(container.firstChild).toBeInstanceOf(Text)
    expect(container.firstChild!.textContent).toBe("NaN")
  })

  test("Infinity becomes Text node", () => {
    const container = <div>{Infinity}</div> as HTMLDivElement
    expect(container.firstChild).toBeInstanceOf(Text)
    expect(container.firstChild!.textContent).toBe("Infinity")
  })
})

describe("Children Flattening & Ordering", () => {
  test("single string child", () => {
    const container = <div>hello</div> as HTMLDivElement
    expect(container.childNodes.length).toBe(1)
    expect(container.textContent).toBe("hello")
  })

  test("multiple children in order", () => {
    const container = <div>{"a"}{"b"}{"c"}</div> as HTMLDivElement
    expect(container.childNodes.length).toBe(3)
    expect(container.textContent).toBe("abc")
  })

  test("nested arrays are flattened", () => {
    const container = <div>{["a", ["b", ["c"]]]}</div> as HTMLDivElement
    expect(container.childNodes.length).toBe(3)
    expect(container.textContent).toBe("abc")
  })

  test("mixed children types", () => {
    const span = <span>x</span>
    const container = <div>{span}{"text"}{null}{42}</div> as HTMLDivElement
    expect(container.childNodes.length).toBe(4)
    expect(container.childNodes[0]).toBe(span)
    expect(container.childNodes[1]).toBeInstanceOf(Text)
    expect(container.childNodes[2]).toBeInstanceOf(Comment)
    expect(container.childNodes[3]).toBeInstanceOf(Text)
  })

  test("Set iterable", () => {
    const container = <div>{new Set(["a", "b"])}</div> as HTMLDivElement
    expect(container.childNodes.length).toBe(2)
    expect(container.textContent).toBe("ab")
  })

  test("generator function", () => {
    function* gen() {
      yield "a"
      yield "b"
      yield "c"
    }
    const container = <div>{gen()}</div> as HTMLDivElement
    expect(container.childNodes.length).toBe(3)
    expect(container.textContent).toBe("abc")
  })

  test("DOM order matches depth-first left-to-right", () => {
    const container = <div>{[["a", "b"], [["c"], "d"], "e"]}</div> as HTMLDivElement
    expect(container.textContent).toBe("abcde")
  })
})

describe("Reactive Terminal Child Swapping", () => {
  test("initial node reflects peek value", async () => {
    const content = r("initial")
    const container = <div>{content}</div> as HTMLDivElement
    document.body.appendChild(container)
    flush()

    expect(container.textContent).toBe("initial")

    document.body.removeChild(container)
  })

  test("update swaps node in-place", async () => {
    const content = r("a")
    const container = <div>{content}</div> as HTMLDivElement
    document.body.appendChild(container)
    flush()

    content.value = "b"
    flush()

    expect(container.textContent).toBe("b")
    expect(container.childNodes.length).toBe(1)

    document.body.removeChild(container)
  })

  test("swap across types: string to null", async () => {
    const content = r<string | null>("text")
    const container = <div>{content}</div> as HTMLDivElement
    document.body.appendChild(container)
    flush()

    expect(container.firstChild).toBeInstanceOf(Text)

    content.value = null
    flush()

    expect(container.firstChild).toBeInstanceOf(Comment)
    expect((container.firstChild as Comment).data).toBe("null")

    document.body.removeChild(container)
  })

  test("swap across types: null to Node", async () => {
    const span = <span>hello</span>
    const content = r<null | Node>(null)
    const container = <div>{content}</div> as HTMLDivElement
    document.body.appendChild(container)
    flush()

    expect(container.firstChild).toBeInstanceOf(Comment)

    content.value = span
    flush()

    expect(container.firstChild).toBe(span)

    document.body.removeChild(container)
  })

  test("ownedReactivesSymbol tracks reactive on initial node", async () => {
    const content = r("a")
    const container = <div>{content}</div> as HTMLDivElement
    document.body.appendChild(container)
    flush()

    const node = container.firstChild as Text
    expect(node[ownedReactivesSymbol]).toBeDefined()
    expect(node[ownedReactivesSymbol]?.size).toBe(1)

    document.body.removeChild(container)
  })

  test("swap to iterable upgrades to iterable swapper", async () => {
    const content = r<string | string[]>("single")
    const container = <div>{content}</div> as HTMLDivElement
    document.body.appendChild(container)
    flush()

    expect(container.childNodes.length).toBe(1)

    content.value = ["a", "b", "c"]
    flush()

    expect(container.textContent).toBe("abc")

    document.body.removeChild(container)
  })

  test("warns when swapping without parent", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})

    const content = r("a")
    const container = <div>{content}</div> as HTMLDivElement
    flush()

    const node = container.firstChild as Text
    node.remove()

    content.value = "b"
    flush()

    expect(warnSpy).toHaveBeenCalled()
    warnSpy.mockRestore()
  })
})

describe("Terminal ↔ Iterable Transitions", () => {
  test("terminal to iterable transition", async () => {
    const content = r<string | string[]>("single")
    const container = <div>{content}</div> as HTMLDivElement
    document.body.appendChild(container)
    flush()

    expect(container.textContent).toBe("single")
    expect(container.childNodes.length).toBe(1)

    content.value = ["a", "b", "c"]
    flush()

    expect(container.textContent).toBe("abc")
    const nodes = [...container.childNodes]
    expect(nodes[0]).toBeInstanceOf(Comment)
    expect((nodes[0] as Comment).data).toBe("[")
    expect(nodes[nodes.length - 1]).toBeInstanceOf(Comment)
    expect((nodes[nodes.length - 1] as Comment).data).toBe("]")
  })

  test("iterable to terminal transition", async () => {
    const content = r<string[] | string>(["a", "b"])
    const container = <div>{content}</div> as HTMLDivElement
    document.body.appendChild(container)
    flush()

    expect(container.textContent).toBe("ab")
    expect(container.firstChild).toBeInstanceOf(Comment)

    content.value = "single"
    flush()

    expect(container.textContent).toBe("single")
    expect(container.childNodes.length).toBe(1)
    expect(container.firstChild).toBeInstanceOf(Text)
  })

  test("terminal → iterable → terminal round trip", async () => {
    const content = r<string | string[]>("start")
    const container = <div>{content}</div> as HTMLDivElement
    document.body.appendChild(container)
    flush()

    content.value = ["a", "b"]
    flush()
    expect(container.textContent).toBe("ab")

    content.value = "end"
    flush()
    expect(container.textContent).toBe("end")
    expect(container.childNodes.length).toBe(1)
  })

  test("reactive iterable updates after mount", async () => {
    const items = r(["a", "b"])
    const container = <div>{items}</div> as HTMLDivElement
    document.body.appendChild(container)
    flush()

    expect(container.textContent).toBe("ab")

    items.value = ["x", "y", "z"]
    flush()
    expect(container.textContent).toBe("xyz")

    items.value = []
    flush()
    expect(container.childNodes.length).toBe(2)
    expect(container.textContent).toBe("")
  })
})

describe("ownedReactivesSymbol bookkeeping", () => {
  test("reactive child node has ownedReactives set", async () => {
    const content = r("test")
    const container = <div>{content}</div> as HTMLDivElement
    document.body.appendChild(container)
    flush()

    const node = container.firstChild!
    expect(node[ownedReactivesSymbol]).toBeDefined()
    expect(node[ownedReactivesSymbol]!.size).toBe(1)
  })

  test("ownership transfers on swap", async () => {
    const content = r("first")
    const container = <div>{content}</div> as HTMLDivElement
    document.body.appendChild(container)
    flush()

    const oldNode = container.firstChild!
    expect(oldNode[ownedReactivesSymbol]!.size).toBe(1)

    content.value = "second"
    flush()

    const newNode = container.firstChild!
    expect(newNode).not.toBe(oldNode)
    expect(newNode[ownedReactivesSymbol]!.size).toBe(1)
    expect(oldNode[ownedReactivesSymbol]!.size).toBe(0)
  })
})

describe("unmounted node behavior", () => {
  test("updating reactive after node removed from parent warns but doesn't throw", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
    const content = r("initial")
    const container = <div>{content}</div> as HTMLDivElement
    document.body.appendChild(container)
    flush()

    const node = container.firstChild!
    container.removeChild(node)

    content.value = "updated"
    flush()

    expect(warnSpy).toHaveBeenCalled()
    warnSpy.mockRestore()
  })
})

describe("nested reactive children", () => {
  test("nested reactive resolves correctly", async () => {
    const inner = r("hello")
    const outer = r(inner)
    const container = <div>{outer}</div> as HTMLDivElement
    document.body.appendChild(container)
    flush()

    expect(container.textContent).toBe("hello")

    inner.value = "world"
    flush()
    expect(container.textContent).toBe("world")
  })

  test("switching nested reactive", async () => {
    const a = r("A")
    const b = r("B")
    const outer = r<Reactive<string>>(a)
    const container = <div>{outer}</div> as HTMLDivElement
    document.body.appendChild(container)
    flush()

    expect(container.textContent).toBe("A")

    outer.value = b
    flush()
    expect(container.textContent).toBe("B")

    a.value = "A2"
    flush()
    expect(container.textContent).toBe("B")
  })
})

describe("Reactive Iterable Swapping", () => {
  test("initial render has markers and content", () => {
    const items = r(["a", "b"])
    const container = <div>{items}</div> as HTMLDivElement
    document.body.appendChild(container)

    expect(container.textContent).toBe("ab")

    document.body.removeChild(container)
  })

  test("update replaces only interior content", async () => {
    const before = <span>before</span>
    const after = <span>after</span>
    const items = r<string[]>(["a", "b"])
    const container = <div>{before}{items}{after}</div> as HTMLDivElement
    document.body.appendChild(container)
    flush()

    expect(container.textContent).toBe("beforeabafter")

    items.value = ["x", "y", "z"]
    flush()

    expect(container.firstChild).toBe(before)
    expect(container.lastChild).toBe(after)
    expect(container.textContent).toBe("beforexyzafter")

    document.body.removeChild(container)
  })

  test("update with different length", async () => {
    const items = r<string[]>(["a", "b", "c"])
    const container = <div>{items}</div> as HTMLDivElement
    document.body.appendChild(container)
    flush()

    expect(container.textContent).toBe("abc")

    items.value = ["x"]
    flush()

    expect(container.textContent).toBe("x")

    items.value = ["1", "2", "3", "4", "5"]
    flush()

    expect(container.textContent).toBe("12345")

    document.body.removeChild(container)
  })
})

describe("applyStyles", () => {
  test("sets style property", () => {
    const div = document.createElement("div")
    applyStyles(div, { color: "red" })
    expect(div.style.color).toBe("red")
  })

  test("removes style when null", () => {
    const div = document.createElement("div")
    div.style.color = "red"
    applyStyles(div, { color: null })
    expect(div.style.color).toBe("")
  })

  test("removes style when undefined", () => {
    const div = document.createElement("div")
    div.style.color = "red"
    applyStyles(div, { color: undefined })
    expect(div.style.color).toBe("")
  })

  test("reactive style updates", async () => {
    const color = r("red")
    const div = document.createElement("div")
    applyStyles(div, { color })
    flush()

    expect(div.style.color).toBe("red")

    color.value = "blue"
    flush()

    expect(div.style.color).toBe("blue")
  })

  test("reactive tracks ownership", () => {
    const color = r("red")
    const div = document.createElement("div")
    applyStyles(div, { color })

    expect(div[ownedReactivesSymbol]?.has(color)).toBe(true)
  })

  test("reactive style removal", async () => {
    const color = r<string | null>("red")
    const div = document.createElement("div") as HTMLDivElement
    applyStyles(div, { color })
    flush()

    expect(div.style.color).toBe("red")

    color.value = null
    flush()
    expect(div.style.color).toBe("")
  })

  test("CSS custom property with reactive value", async () => {
    const custom = r<string>("blue")
    const div = document.createElement("div") as HTMLDivElement
    applyStyles(div, { "--custom": custom } as any)
    flush()

    expect(div.style.getPropertyValue("--custom")).toBe("blue")

    custom.value = "green"
    flush()
    expect(div.style.getPropertyValue("--custom")).toBe("green")
  })
})

describe("applyClasses", () => {
  test("adds class when true", () => {
    const div = document.createElement("div")
    applyClasses(div, { active: true })
    expect(div.classList.contains("active")).toBe(true)
  })

  test("removes class when false", () => {
    const div = document.createElement("div")
    div.classList.add("active")
    applyClasses(div, { active: false })
    expect(div.classList.contains("active")).toBe(false)
  })

  test("removes class when null", () => {
    const div = document.createElement("div")
    div.classList.add("active")
    applyClasses(div, { active: null })
    expect(div.classList.contains("active")).toBe(false)
  })

  test("reactive class updates", async () => {
    const active = r(true)
    const div = document.createElement("div")
    applyClasses(div, { active })
    flush()

    expect(div.classList.contains("active")).toBe(true)

    active.value = false
    flush()

    expect(div.classList.contains("active")).toBe(false)
  })

  test("multiple classes", () => {
    const div = document.createElement("div")
    applyClasses(div, { active: true, disabled: false, loading: true })
    expect(div.classList.contains("active")).toBe(true)
    expect(div.classList.contains("disabled")).toBe(false)
    expect(div.classList.contains("loading")).toBe(true)
  })

  test("reactive class toggling", async () => {
    const active = r(true)
    const div = document.createElement("div")
    applyClasses(div, { active })
    flush()

    expect(div.classList.contains("active")).toBe(true)

    active.value = false
    flush()
    expect(div.classList.contains("active")).toBe(false)

    active.value = true
    flush()
    expect(div.classList.contains("active")).toBe(true)
  })
})

describe("applyAttributes", () => {
  test("sets string attribute", () => {
    const div = document.createElement("div")
    applyAttributes(div, { id: "test" })
    expect(div.getAttribute("id")).toBe("test")
  })

  test("sets number attribute as string", () => {
    const input = document.createElement("input")
    applyAttributes(input, { tabindex: 5 })
    expect(input.getAttribute("tabindex")).toBe("5")
  })

  test("removes attribute when null", () => {
    const div = document.createElement("div")
    div.setAttribute("id", "test")
    applyAttributes(div, { id: null })
    expect(div.hasAttribute("id")).toBe(false)
  })

  test("toggleAttribute true adds attribute", () => {
    const input = document.createElement("input")
    applyAttributes<"input">(input, { disabled: true })
    expect(input.hasAttribute("disabled")).toBe(true)
  })

  test("toggleAttribute false removes attribute", () => {
    const input = document.createElement("input")
    input.setAttribute("disabled", "")
    applyAttributes<"input">(input, { disabled: false })
    expect(input.hasAttribute("disabled")).toBe(false)
  })

  test("reactive attribute updates", async () => {
    const id = r("first")
    const div = document.createElement("div")
    applyAttributes(div, { id })
    flush()

    expect(div.getAttribute("id")).toBe("first")

    id.value = "second"
    flush()

    expect(div.getAttribute("id")).toBe("second")
  })

  test("reactive toggle: string to boolean to null", async () => {
    const value = r<string | boolean | null>("text")
    const div = document.createElement("div")
    applyAttributes(div, { "data-test": value } as any)
    flush()

    expect(div.getAttribute("data-test")).toBe("text")

    value.value = true
    flush()
    expect(div.hasAttribute("data-test")).toBe(true)

    value.value = false
    flush()
    expect(div.hasAttribute("data-test")).toBe(false)

    value.value = null
    flush()
    expect(div.hasAttribute("data-test")).toBe(false)
  })

  test("boolean attribute true/false/null transitions", async () => {
    const disabled = r<boolean | null>(true)
    const div = document.createElement("div")
    applyAttributes(div, { disabled } as any)
    flush()

    expect(div.hasAttribute("disabled")).toBe(true)

    disabled.value = false
    flush()
    expect(div.hasAttribute("disabled")).toBe(false)

    disabled.value = true
    flush()
    expect(div.hasAttribute("disabled")).toBe(true)

    disabled.value = null
    flush()
    expect(div.hasAttribute("disabled")).toBe(false)
  })
})

describe("t() Text Node Creation", () => {
  test("non-reactive returns Text node", () => {
    const node = t("hello")
    expect(node).toBeInstanceOf(Text)
    expect(node.textContent).toBe("hello")
  })

  test("number converted to string", () => {
    const node = t(42)
    expect(node.textContent).toBe("42")
  })

  test("reactive text updates", async () => {
    const text = r("initial")
    const node = t(text)
    flush()

    expect(node.textContent).toBe("initial")

    text.value = "updated"
    flush()

    expect(node.textContent).toBe("updated")
  })

  test("reactive node reference is stable", async () => {
    const text = r("a")
    const node = t(text)
    flush()

    text.value = "b"
    flush()

    text.value = "c"
    flush()

    expect(t(text)).not.toBe(node)
    expect(node.textContent).toBe("c")
  })
})

describe("JSX Integration", () => {
  test("Fragment with single child returns child", () => {
    const a = <a />
    expect(<>test</>).toEqual("test")
    expect(<>{ a }</>).toEqual(a)
  })

  test("Fragment with multiple children returns array", () => {
    const a = <a />
    const b = <b />
    expect(<>{ a }{ b }</>).toEqual([a, b])
    expect(<>{ "a" }b{ "c" }</>).toEqual(["a", "b", "c"])
  })

  test("jsx creates correct HTML element types", () => {
    expect(<div />).toBeInstanceOf(HTMLDivElement)
    expect(<span />).toBeInstanceOf(HTMLSpanElement)
    expect(<input />).toBeInstanceOf(HTMLInputElement)
    expect(<button />).toBeInstanceOf(HTMLButtonElement)
  })

  test("jsx creates SVG element with namespace", () => {
    const path = <path bruh={{ namespace: "http://www.w3.org/2000/svg" }} />
    expect(path).toBeInstanceOf(SVGPathElement)
    expect(path.namespaceURI).toBe("http://www.w3.org/2000/svg")
  })

  test("jsx creates MathML element with namespace", () => {
    const math = <semantics bruh={{ namespace: "http://www.w3.org/1998/Math/MathML" }} />
    expect(math).toBeInstanceOf(MathMLElement)
    expect(math.namespaceURI).toBe("http://www.w3.org/1998/Math/MathML")
  })

  test("jsx applies style object", () => {
    const div = <div style={{ color: "red", "font-size": "16px" }} /> as HTMLDivElement
    expect(div.style.color).toBe("red")
    expect(div.style.fontSize).toBe("16px")
  })

  test("jsx applies class object", () => {
    const div = <div class={{ active: true, disabled: false }} /> as HTMLDivElement
    expect(div.classList.contains("active")).toBe(true)
    expect(div.classList.contains("disabled")).toBe(false)
  })

  test("jsx attaches event listeners", () => {
    const spy = vi.fn()
    const button = <button onclick={spy} /> as HTMLButtonElement
    button.click()
    expect(spy).toHaveBeenCalledTimes(1)
  })

  test("jsx event listener receives event object", () => {
    let receivedEvent: MouseEvent | null = null
    const button = <button onclick={e => { receivedEvent = e }} /> as HTMLButtonElement
    button.click()
    expect(receivedEvent).toBeInstanceOf(MouseEvent)
  })

  test("jsx components are called with props", () => {
    const Component = (props: { name: string; children?: any }) => (
      <div class={{ [props.name]: true }}>{props.children}</div>
    )
    const result = <Component name="test">content</Component> as HTMLDivElement
    expect(result).toBeInstanceOf(HTMLDivElement)
    expect(result.classList.contains("test")).toBe(true)
    expect(result.textContent).toBe("content")
  })

  test("jsx key prop is passed through", () => {
    const symbol = Symbol()
    const F = (x: unknown) => x
    expect(<F key={symbol}>{symbol}</F>).toEqual({ key: symbol, children: symbol })
  })

  test("reactive child does not recreate sibling DOM nodes", async () => {
    const content = r("initial")
    const container = <div><input type="text" /><span>{content}</span></div> as HTMLDivElement
    document.body.appendChild(container)

    const input = container.querySelector("input")!
    input.value = "user typed this"

    content.value = "updated"
    flush()

    expect(input.value).toBe("user typed this")
    expect(container.querySelector("input")).toBe(input)

    document.body.removeChild(container)
  })

  test("reactive child swap preserves other children", async () => {
    const showA = r(true)
    const container = <div><textarea />{r(() => showA.value ? <span>A</span> : <span>B</span>)}</div> as HTMLDivElement
    document.body.appendChild(container)

    const textarea = container.querySelector("textarea")!
    textarea.value = "user input"

    showA.value = false
    flush()

    expect(textarea.value).toBe("user input")
    expect(container.querySelector("textarea")).toBe(textarea)

    document.body.removeChild(container)
  })
})

describe("BruhText Custom Element", () => {
  test("replaces itself with Text node", () => {
    const container = document.createElement("div")
    container.innerHTML = "<bruh-text>hello</bruh-text>"
    document.body.appendChild(container)

    expect(container.firstChild).toBeInstanceOf(Text)
    expect(container.textContent).toBe("hello")

    document.body.removeChild(container)
  })

  test("tag attribute tracks in hydrated map", () => {
    const container = document.createElement("div")
    container.innerHTML = '<bruh-text tag="test-tag">content</bruh-text>'
    document.body.appendChild(container)

    expect(BruhText.hydrated["test-tag"]).toBeDefined()
    expect(BruhText.hydrated["test-tag"].size).toBeGreaterThan(0)

    document.body.removeChild(container)
  })

  test("multiple elements with same tag accumulate", () => {
    const container = document.createElement("div")
    container.innerHTML = `
      <bruh-text tag="multi">first</bruh-text>
      <bruh-text tag="multi">second</bruh-text>
    `
    document.body.appendChild(container)

    expect(BruhText.hydrated["multi"].size).toBeGreaterThanOrEqual(2)

    document.body.removeChild(container)
  })
})

describe("Property-Based Tests", () => {
  const terminalArbitrary = fc.oneof(
    fc.string(),
    fc.integer(),
    fc.double({ noNaN: true }),
    fc.boolean(),
    fc.constant(null),
    fc.constant(undefined)
  )

  fcTest.prop([fc.array(terminalArbitrary, { maxLength: 10 })])(
    "children count matches terminal count",
    (children) => {
      const container = jsx("div", { children })
      expect(container.childNodes.length).toBe(children.length)
    }
  )

  fcTest.prop([fc.array(fc.string(), { minLength: 1, maxLength: 10 })])(
    "string children order preserved",
    (strings) => {
      const container = jsx("div", { children: strings }) as HTMLDivElement
      expect(container.textContent).toBe(strings.join(""))
    }
  )

  fcTest.prop([fc.record({
    active: fc.boolean(),
    disabled: fc.boolean(),
    loading: fc.boolean(),
    hidden: fc.boolean()
  })])(
    "class object matches classList",
    (classes) => {
      const div = document.createElement("div")
      applyClasses(div, classes)
      for (const [name, value] of Object.entries(classes)) {
        expect(div.classList.contains(name)).toBe(value)
      }
    }
  )

  fcTest.prop([fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 5 })])(
    "reactive iterable update reflects in DOM",
    async (initial) => {
      const items = r(initial)
      const container = jsx("div", { children: items }) as HTMLDivElement
      document.body.appendChild(container)

      expect(container.textContent).toBe(initial.join(""))

      document.body.removeChild(container)
    }
  )
})
