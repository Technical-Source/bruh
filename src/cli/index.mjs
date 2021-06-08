#!/usr/bin/env node
import { processImages } from "../media/images.mjs"
import { join } from "path"

import { Command } from "commander/esm.mjs"
const program = new Command()

program
  .command("process-images <directory>")
  .description("Processes the images in the given directory for the optimized-picture component")
  .action(directory => {
    const imagesDirectory = join(process.cwd(), directory)
    processImages(imagesDirectory)
  })

program.parse(process.argv)
