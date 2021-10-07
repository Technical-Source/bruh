import { e } from "bruh/dom"
import { functionAsObject } from "bruh/util"
const { picture, source, img } = functionAsObject(e)

import { readFile } from "fs/promises"

export default async options => {
  const imagePath = options.src

  const { width, height, lqip } = JSON.parse(
    await readFile(`${imagePath}.json`)
  )

  return picture({ class: "bruh-optimized-picture" },
    source({ type: "image/avif", srcset: `${imagePath}.avif` }),
    source({ type: "image/webp", srcset: `${imagePath}.webp` }),
    img({
      src:     imagePath,
      alt:     options.alt     || "",
      width:   options.width   || width,
      height:  options.height  || height,
      loading: options.loading || "lazy",
      style:   `background-image: url(${lqip})`
    })
  )
}
