import { r } from "./index.mjs"

const idToReactive  = {}
const idToResolvers = {}

// Object from id to a promise for that remote reactive
export const remoteReactives =
  new Proxy({}, {
    async get(_, id) {
      // Already have it
      if (id in idToReactive)
        return idToReactive[id]

      // It isn't defined yet, queue up the resolver
      return new Promise(resolve => {
        if (!id in idToResolvers)
          idToResolvers[id] = []

        idToResolvers[id].push(resolve)
      })
    }
  })

// Set a remote reactive from the server
export const setFromRemote = (id, value) => {
  // Update
  if (id in idToReactive)
    idToReactive[id].value = value
  // New, add and resolve all previous requests
  else {
    const reactive = r(value)
    idToReactive[id] = reactive
    idToResolvers[id]?.forEach(resolve => resolve(reactive))
    delete idToResolvers[id]
  }
}
