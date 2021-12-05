import net from "net"
import polka from "polka"
import sirv from "sirv"
import { WebSocketServer } from "ws"

const isPortAvailable = port =>
  new Promise(resolve => {
    const server = net.createServer()
    server.unref()
    server.on('error', () => resolve(false))

    server.listen(port, () => {
      server.close()
      resolve(true)
    })
  })

const findPort = async (fromPort = 5000, attempts = 10) => {
  if (!attempts)
    return 0

  const available = await isPortAvailable(fromPort)
  return available
    ? fromPort
    : findPort(fromPort + 1, attempts - 1)
}

const app = polka()
  .use(
    sirv("./frontend", {
      dev: true,

    })
  )

const port = await findPort()
app
  .listen(port, () => {
    console.log(`listening on http://localhost:${app.server.address().port}`)
  })

const wss = new WebSocketServer({ server: app.server })
wss.on('connection', socket => {
  socket.on('message', data => {
    console.log("Received data", JSON.parse(data))
  })
})
