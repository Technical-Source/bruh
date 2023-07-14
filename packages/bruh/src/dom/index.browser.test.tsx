/** @jsxImportSource bruh/browser */
import { describe, test, expect, vi, bench } from "vitest"
import { r } from "../reactive/index.mts"

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

describe("Browser DOM", () => {
  test("JSX Fragment with single child is child", () => {
    const a = <a />
    expect(<>test</>).toEqual("test")
    expect(<>{ a }</>).toEqual(a)
  })

  test("JSX Fragment with multiple children is children array", () => {
    const a = <a />
    const b = <b />
    expect(<>{ a }{ b }</>).toEqual([a, b])
    expect(<>{ "a" }b{ "c" }</>).toEqual(["a", "b", "c"])
  })

  test("JSX components are functions", () => {
    const symbol = Symbol()
    const F = (x: unknown) => x
    expect(
      <F key={symbol}>{symbol}</F>
    ).toEqual({
      key: symbol,
      children: symbol
    })
    expect(
      <F key={symbol}>{symbol} {symbol}</F>
    ).toEqual({
      key: symbol,
      children: [symbol, " ", symbol]
    })
  })

  test("JSX HTML element", () => {
    expect(<div />).toBeInstanceOf(HTMLDivElement)
  })

  test("JSX SVG element", () => {
    expect(
      <path
        bruh={{
          namespace: "http://www.w3.org/2000/svg"
        }}
      />
    ).toBeInstanceOf(SVGPathElement)
  })

  test("JSX MathML element", () => {
    expect(
      <semantics
        bruh={{
          namespace: "http://www.w3.org/1998/Math/MathML"
        }}
      />
    ).toBeInstanceOf(MathMLElement)
  })
})
