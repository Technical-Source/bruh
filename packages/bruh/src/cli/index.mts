#!/usr/bin/env node

import { processImages } from "../media/images.node.mts"
import { join } from "path"

import { cac } from "cac"
const cli = cac("bruh")

cli
  .command(
    "process-images <directory>",
    "Processes the images in the given directory for the optimized-picture component"
  )
  .action(async (directory: string, options) => {
    const imagesDirectory = join(process.cwd(), directory)
    await processImages(imagesDirectory)
  })

cli.help()
cli.parse()
