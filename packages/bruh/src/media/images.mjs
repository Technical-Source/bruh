import sharp from "sharp"
import { readdir, writeFile } from "fs/promises"
import { extname, join } from "path"

const avif = async (filePath, sharpInstance) =>
  sharpInstance
    .avif({  })
    .toFile(`${filePath}.avif`)

const webp = async (filePath, sharpInstance) =>
  sharpInstance
    .webp({  })
    .toFile(`${filePath}.webp`)

// Low Quality Image Placeholder inline css for the <img> style attribute
const json = async (filePath, sharpInstance) => {
  const imageManifest = {}

  const metadata = await sharpInstance.metadata()
  imageManifest.format = metadata.format
  imageManifest.width  = metadata.width
  imageManifest.height = metadata.height

  const buffer = await sharpInstance
    .resize({ fit: "inside", width: 16, height: 16 })
    .blur()
    .webp({ reductionEffort: 6 })
    .toBuffer()

  imageManifest.lqip = `data:image/webp;base64,${buffer.toString("base64")}`
  return writeFile(`${filePath}.json`, JSON.stringify(imageManifest))
}

const getUnprocessedImages = async directory => {
  const directoryEntries = await readdir(directory, { withFileTypes: true })
  
  const promisedUnproccessedImages = directoryEntries
    .map(async entry => {
      const entryPath = join(directory, entry.name)

      if (entry.isDirectory())
        return await getUnprocessedImages(entryPath)

      if (
        entry.name[0] == "." ||
        [".avif", ".webp", ".json"]
          .includes(extname(entry.name)) ||
        directoryEntries.some(siblingEntry =>
          [".avif", ".webp", ".json"]
            .map(processedExtention => `${entry.name}${processedExtention}`)
            .includes(siblingEntry.name)
        )
      )
        return []

      return [entryPath]
    })
  
  return (await Promise.all(promisedUnproccessedImages)).flat()
}

export const processImages = async directory => {
  const unprocessedImages = await getUnprocessedImages(directory)
  for (const filePath of unprocessedImages) {
    await Promise.all(
      [avif, webp, json]
        .map(process => process(filePath, sharp(filePath)))
    )
  }
}
