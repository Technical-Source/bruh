import { handleSocket, connect } from "../websocket/index.browser.mjs"

export const reactiveSocket = connect()
export const handlers = {
  byType: {}
}

export const send = handleSocket(reactiveSocket, handlers)
