import { handlers, send } from "./websocket.mjs"
import { r } from "../reactive/index.mjs"

const reactives = {}
const stopSendingUpdates = {}

const remoteReactives =
  new Proxy(reactives, {
    get(_, id) {
      if (!(id in reactives))
        remoteReactives[id] = r()

      return reactives[id]
    },

    set(_, id, reactive) {
      stopSendingUpdates[id]?.()
      reactives[id] = reactive
      stopSendingUpdates[id] = reactive.addReaction(() =>
        send({
          type: "setReactive",
          id,
          value: reactive.value
        })
      )

      return true
    },

    deleteProperty(_, id) {
      stopSendingUpdates[id]?.()
      return delete reactives[id]
    }
  })


handlers.byType.setReactive = ({ id, value }) => {
  remoteReactives[id].value = value
}

export default remoteReactives
