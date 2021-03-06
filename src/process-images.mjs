import sharp from "sharp"
import { readdir, readFile, writeFile } from "fs/promises"
import { extname, join } from "path"

const imagesDirectory = join(process.cwd(), "public", "images")

const avif = async (filePath, file) =>
  sharp(await file)
    .avif({  })
    .toFile(`${filePath}.avif`)

const webp = async (filePath, file) =>
  sharp(await file)
    .webp({  })
    .toFile(`${filePath}.webp`)

// Low Quality Image Placeholder inline css for the <img> style attribute
const json = async (filePath, file) => {
  const info = {}

  const image = sharp(await file)
  const { hasAlpha } = await image.metadata()
  if (!hasAlpha) {
    const buffer = await image
      .resize({ fit: "inside", width: 16, height: 16 })
      .blur()
      .webp({ reductionEffort: 6 })
      .toBuffer()
    const uri = `data:image/webp;base64,${buffer.toString("base64")}`
    info.lqip = {
      "backgroundImage": `url(${uri})`
    }
  }
  else {
    info.lqip = {}
  }
  return writeFile(`${filePath}.json`, JSON.stringify(info))
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

export const processImages = async (directory = imagesDirectory) => {
  const unprocessedImages = await getUnprocessedImages(directory)
  const processes = unprocessedImages
    .map(filePath => ({ filePath, file: readFile(filePath) }))
    .flatMap(({ filePath, file }) =>
      [avif, webp, json]
        .map(process => process(filePath, file))
    )
    
  return Promise.allSettled(processes)
}
