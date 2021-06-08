import { seconds } from "./prerender.mjs"

const secondsTextNode = seconds.hydrate(document.querySelector(`[data-bruh-hydrate="seconds"]`))

secondsTextNode.bruh.startClock()
