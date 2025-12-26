/** @jsxImportSource bruh/server */
import { readFile } from "node:fs/promises"

const OptimizedPicture = async (
  options: {
    src: string,
    alt?: string,
    width?: number,
    height?: number,
    loading?: "lazy" | "eager"
  }
) => {
  const imagePath = options.src

  const { width, height, lqip } = JSON.parse(
    await readFile(`${imagePath}.json`, "utf-8")
  ) as {
    width: number,
    height: number,
    lqip: string
  }

  const picture =
    <picture class="bruh-optimized-picture">
      <source type="image/avif" srcset={`${imagePath}.avif`} />
      <source type="image/webp" srcset={`${imagePath}.webp`} />
      <img
        src={imagePath}
        alt={options.alt || ""}
        width={options.width || width}
        height={options.height || height}
        loading={options.loading || "lazy"}
        style={`background-image: url(${lqip})`}
      />
    </picture>

  return picture
}

export default OptimizedPicture
