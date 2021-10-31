#!/usr/bin/env node

import { resolve } from "path"
import { readFile, writeFile, rename } from "fs/promises"

import prompts from "prompts"
import kleur from "kleur"

import { assertVersion, copy, commentedCommands } from "./utils.mjs"

await assertVersion().catch(({ actual: current, expected: latest }) => {
  console.error(`You are running create-bruh@${current}, when the latest version is ${latest}`)
  console.log("This can be corrected by running:")
  console.log(kleur.bold().green("npm init bruh@latest"))
  process.exit(1)
})

const questions = [
  {
    type: "select",
    name: "template",
    message: "Choose a template (vite is recommended)",
    choices: [
      {
        title: "vite",
        value: "./vite/",
        description: "The fastest and most feature-rich choice"
      },
      {
        title: "minimal",
        value: "./minimal/",
        description: "The absolute simplest possible (no build tool)"
      }
    ],
    initial: 0
  },
  {
    type: "text",
    name: "name",
    message: "What will you name this package?"
  },
  {
    type: "text",
    name: "directory",
    message: "Which directory to scaffold the package? (the project's root)",
    initial: "./"
  }
]

const answers = await prompts(questions, {
  onCancel() {
    console.error("You cancelled early, so nothing happened.")
    process.exit(1)
  }
})
const template = answers.template
const packageDirectory = resolve(process.cwd(), answers.directory)

await copy(
  new URL(template, import.meta.url).pathname,
  packageDirectory
)

await rename(
  resolve(packageDirectory, "gitignore"),
  resolve(packageDirectory, ".gitignore")
)

const packageDotJson = resolve(packageDirectory, "package.json")
const packageObject = JSON.parse( await readFile(packageDotJson) )
packageObject.name = answers.name
await writeFile(packageDotJson, JSON.stringify(packageObject, null, 2))

console.log(kleur.bold().green("Done!\n"))

console.log(kleur.bold("Now just:"))

commentedCommands(
  [`cd ${answers.directory}`, "Go to your new package directory"],
  ["npm i",                   "Install dependencies"],
  ["npm run dev",             "Start coding!"]
)
