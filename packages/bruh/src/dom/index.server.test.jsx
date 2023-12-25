import { describe, test, expect, vi } from "vitest"
import {
  isMetaNode,
  isMetaTextNode,
  isMetaElement,
  isMetaRawString,
  applyStyles,
  applyClasses,
  applyAttributes,
  rawString,
  t,
  h, // @jsx h
  JSXFragment, // @jsxFrag JSXFragment
  makeDocument,
  replaceDeferredScriptContent,
  replaceDeferredHash
} from "./index.server.mjs"

describe("Server DOM", () => {
  test("JSX Fragment is array", () => {
    const a = <a />
    const b = <b />
    expect(<>{ a }{ b }</>).toEqual([a, b])
  })

  test("JSX components are functions", () => {
    const symbol = Symbol()
    const F = x => x
    expect(
      <F key={symbol}>{symbol}</F>
    ).toEqual({
      key: symbol,
      children: [symbol]
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

  test("makeDocument", () => {
    const document = makeDocument(
      <html>
        <head></head>
        <body></body>
      </html>
    )
    let result = ""
    for (const chunk of document)
      result += chunk
    expect(result).toBe("<!doctype html><html><head></head><body></body></html>")
  })

  describe("replaceDeferredScript", () => {
    test("hash matches", async () => {
      const hashText = async text => {
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

  test("makeDocument with defer", async () => {
    let result = ''
    const document = makeDocument(({ defer, deferred }) =>
      <html>
        <head>
          <script>{replaceDeferredScriptContent}</script>
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
    for await (const chunk of document)
      if (chunk[Symbol.asyncIterator])
        for await (const chunk2 of chunk)
          result += chunk2
      else
        result += chunk

    expect(result).toBe(
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
