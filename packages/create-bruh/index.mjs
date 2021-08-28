#!/usr/bin/env node

import { resolve } from "path"
import { mkdir, readdir, stat, copyFile, readFile, writeFile, rename } from "fs/promises"

import prompts from "prompts"
import kleur from "kleur"

const questions = [
  {
    type: "select",
    name: "template",
    message: "Choose a template (vite is recommended)",
    choices: [
      { title: "vite",         value: "./vite/" },
      { title: "vite-minimal", value: "./vite-minimal/" },
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
    message: "Which directory to scaffold the package?",
    initial: "./"
  }
]

const answers = await prompts(questions)
const template = answers.template
const packageDirectory = resolve(process.cwd(), answers.directory)

const copyDirectory = async (from, to) => {
  await mkdir(to, { recursive: true })

  return Promise.all(
    (await readdir(from))
      .map(entry =>
        copy(
          resolve(from, entry),
          resolve(to, entry)
        )
      )
  )
}

const copy = async (from, to) => {
  const statResult = await stat(from)

  if (statResult.isDirectory())
    return copyDirectory(from, to)
  else
    return copyFile(from, to)
}

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

const commentedCommands = (...lines) => {
  const commandLength = Math.max(
    ...lines.map(([command]) => command.length)
  )
  lines
    .map(([command, comment]) => [command.padEnd(commandLength), comment])
    .map(([command, comment]) => [command, kleur.gray(`# ${comment}`)])
    .map(([command, comment]) => `${command} ${comment}`)
    .forEach(line => console.log(line))
}

commentedCommands(
  [`cd ${answers.directory}`, "Go to your new package directory"],
  ["npm i",                   "Install dependencies"],
  ["npm run dev",             "Start coding!"]
)
