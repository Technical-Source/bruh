#!/usr/bin/env node

import { resolve } from "path"
import { mkdir, readdir, stat, copyFile, readFile } from "fs/promises"
import { execSync } from "child_process"
import fetch from "node-fetch"

import kleur from "kleur"
import semver from "semver"
import { AssertionError } from "assert/strict"

export const assertVersion = async () => {
  const { version } = JSON.parse(
    await readFile(
      new URL("./package.json", import.meta.url).pathname
    )
  )
  const latestVersion = await fetch("https://registry.npmjs.org/-/package/create-bruh/dist-tags")
    .then(res => res.json())
    .then(data => data.latest)
    .catch(() => {
      try {
        return execSync("npm view create-bruh version").toString().trim()
      } catch {}
    })

  if (latestVersion && semver.lt(version, latestVersion))
    throw new AssertionError({
      actual: version,
      expected: latestVersion
    })
}

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

export const copy = async (from, to) => {
  const statResult = await stat(from)

  if (statResult.isDirectory())
    return copyDirectory(from, to)
  else
    return copyFile(from, to)
}

export const commentedCommands = (...lines) => {
  const commandLength = Math.max(
    ...lines.map(([command]) => command.length)
  )
  lines
    .map(([command, comment]) => [command.padEnd(commandLength), comment])
    .map(([command, comment]) => [command, kleur.gray(`# ${comment}`)])
    .map(([command, comment]) => `${command} ${comment}`)
    .forEach(line => console.log(line))
}
