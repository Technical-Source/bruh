import { r } from "../reactive/index.mjs"
import { h, JSXFragment } from "./index.browser.mjs"

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

declare module "./shared.mjs" {
  interface HTMLTagToEventMap {
    "bruh-element": HTMLBruhElementEventMap
  }

  interface Styles {
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
