import { t } from "bruh/dom/meta-node"
import { section, h1, hr } from "bruh/dom/html"
import { svg, circle } from "bruh/dom/svg"

const seconds =
  t(0).setTag("seconds")

export default
  section({ class: "bruh moment" },
    h1(seconds, " seconds so far...")
      .addDataAttributes({ awesome: true }),
    "other text",
    hr(),
    svg({ viewBox: "0 0 10 10" },
      circle({ cx: 5, cy: 5, r: 2 })
    )
  )
