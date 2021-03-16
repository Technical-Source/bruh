import { rebind } from "bruh/dom/index"
import { app, secondsText } from "./app.mjs"

// Rebind all node builder objects to the prerendered document
rebind(app)
// We can now access the actual DOM node that got rebound to
// the imported meta text node and do arbitrary things with it
secondsText.node.bruh.startClock()
