#!/usr/bin/env node
import { processImages } from "bruh/media/images"
import { join } from "path"

import { cac } from "cac"
const cli = cac("bruh", "Command-line interfaces for bruh")

cli
  .command(
    "process-images <directory>",
    "Processes the images in the given directory for the optimized-picture component"
  )
  .action((directory, options) => {
    const imagesDirectory = join(process.cwd(), directory)
    processImages(imagesDirectory)
  })

cli.help()
cli.parse()
