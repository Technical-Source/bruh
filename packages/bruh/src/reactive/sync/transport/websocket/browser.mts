import { r, reactiveDo, type MaybeReactive } from "../../../../reactive/index.mts"

// Intuitive websocket url resolution
export const resolveWebSocketURL = (url: URL | string = "") => {
  // Base off of the current location
  const resolvedURL = new URL(url, location.href)
  // Handle implicitly selection of ws: or wss: based on the context
  if (resolvedURL.protocol !== "ws:" && resolvedURL.protocol !== "wss:")
    resolvedURL.protocol =
      isSecureContext && resolvedURL.protocol !== "http:"
        ? "wss:"
        : "ws:"
  // Fragments aren't allowed in websocket urls
  resolvedURL.hash = ""
  return resolvedURL
}

// websocket connection with automatic reconnection
// Returned as a promise to a reactive socket because the underlying socket
// changes every reconnection
export const connectToWebSocket = (
  url: URL | string,
  initialReconnectDelay = 2 ** -2 * 1000, // 1/4 second
  reconnectDelayCeiling = 2 **  4 * 1000  //  16 seconds
) => {
  const resolvedURL = resolveWebSocketURL(url)
  const reactiveSocket = r<WebSocket>()

  // Every attempt makes a new socket, reattempting after a delay
  const attemptConnection = (delay = initialReconnectDelay) => {
    const socket = new WebSocket(resolvedURL)

    // The reactive value is updated and the delay reset on success
    socket.addEventListener("open", () => {
      reactiveSocket.value = socket
      delay = initialReconnectDelay
    })

    // Whether it fails to connect or the connection is lost later
    socket.addEventListener("close", ({ wasClean }) => {
      // Don't automatically reconnect an intentionally closed websocket
      if (wasClean) return

      setTimeout(() => {
        attemptConnection(Math.min(2 * delay, reconnectDelayCeiling))
      }, delay)
    })
  }

  // kickoff
  attemptConnection()

  return reactiveSocket
}

export type WebSocketHandlers = {
  raw?: (data: Blob | ArrayBuffer) => void
  byType?: {
    [type: string]: (data: any) => void
  }
}

// Handle automatic JSON over websockets, where the websocket can be reactive
export const handleWebSocket = (maybeReactiveWebSocket: MaybeReactive<WebSocket | undefined>, handlers: WebSocketHandlers) => {
  let currentSocket: WebSocket | undefined

  // Account for a potentially reactive socket
  reactiveDo(maybeReactiveWebSocket, socket => {
    if (!socket) return

    currentSocket = socket

    // Handle messages, parsing strings as JSON
    socket.addEventListener("message", ({ data }) => {
      // Raw blob/arraybuffer (socket.binaryType, defaults to blob)
      if (typeof data !== "string")
        handlers.raw?.(data)
      // assume strings are JSON with {"type":"messageType"}
      else {
        const parsed = JSON.parse(data)
        if (handlers.byType?.hasOwnProperty(parsed.type))
          handlers.byType[parsed.type](parsed)
      }
    })
  })

  // A send function that automatically converts objects to JSON
  return (data: unknown) => {
    currentSocket?.send(
      data instanceof Blob || data instanceof ArrayBuffer || ArrayBuffer.isView(data)
        ? data
        : JSON.stringify(data)
    )
  }
}
