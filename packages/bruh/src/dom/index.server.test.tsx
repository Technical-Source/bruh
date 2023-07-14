/** @jsxImportSource bruh/server */
import { describe, test, expect, vi, bench } from "vitest"
import {
  applyStyles,
  applyClasses,
  applyAttributes,
  rawString,
  t,
  replaceDeferredScriptContent,
  replaceDeferredHash,
  MetaDocument
} from "./index.server.mts"

describe("Server DOM", () => {
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

  test("Element toString()", () => {
    expect(
      <div>0 {"<"} 1 && 1 {"<"} 2</div> + ""
    ).toBe(
      "<div>0 &lt; 1 &amp;&amp; 1 &lt; 2</div>"
    )
  })

  test("Void element", () => {
    expect(<base /> + "").toBe("<base>")
    expect(<img /> + "").toBe("<img>")
    expect(<input /> + "").toBe("<input>")
  })

  test("Element attributes", () => {
    expect(
      <div data-a="a" data-escaped={`"&"`} /> + ""
    ).toBe(`<div data-a="a" data-escaped="&quot;&amp;&quot;"></div>`)

    expect(
      <div
        data-null={ null }
        data-undefined={ undefined }
        data-false={ false }
        data-explicit-true={ true }
        data-implicit-true
        data-empty-string={ "" }
      /> + ""
    ).toBe(
      `<div data-explicit-true data-implicit-true data-empty-string></div>`
    )
  })

  test("Raw string", () => {
    expect(
      <div>{ rawString("<!-- comment -->") }</div> + ""
    ).toBe(
      "<div><!-- comment --></div>"
    )
  })

  test("Document toString()", () => {
    const document = new MetaDocument(
      <html>
        <head></head>
        <body></body>
      </html>
    )
    expect(document + "").toBe("<!doctype html><html><head></head><body></body></html>")
  })

  test("Document toStringPromise()", async () => {
    const document = new MetaDocument(
      <html>
        <head></head>
        <body></body>
      </html>
    )

    expect(await document.toStringPromise())
      .toBe("<!doctype html><html><head></head><body></body></html>")
  })

  describe("replaceDeferredScript", () => {
    test("hash matches", async () => {
      const hashText = async (text: string) => {
        const buffer = await crypto.subtle.digest(
          "sha-512",
          new TextEncoder().encode(text)
        )
        let binary = ''
        for (const byte of new Uint8Array(buffer))
          binary += String.fromCharCode(byte)
        return "sha512-" + btoa(binary)
      }

      expect(replaceDeferredHash).toBe(await hashText(replaceDeferredScriptContent))
    })
  })

  test("Document with defer", async () => {
    const document = new MetaDocument(({ defer, deferred, replaceDeferredScript }) =>
      <html>
        <head>
          {replaceDeferredScript}
        </head>
        <body>
          {
            defer({
              placeholder: id =>
                <span id={id}>loading...</span>,

              content: Promise.resolve(<>loaded content</>)
            })
          }

          {deferred}
        </body>
      </html>
    )

    expect(await document.toStringPromise()).toBe(
        "<!doctype html>"
      + "<html>"
      +   "<head>"
      +     `<script>${replaceDeferredScriptContent}</script>`
      +   "</head>"
      +   "<body>"
      +     `<span id="bruh-deferred-0">loading...</span>`
      +     "<template>loaded content</template>"
      +     `<bruh-deferred data-replace="bruh-deferred-0"></bruh-deferred>`
      +   "</body>"
      + "</html>"
    )
  })
})
