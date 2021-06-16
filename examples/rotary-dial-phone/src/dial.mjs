import { circle } from "bruh/dom/svg"

import { pipe } from "bruh/util"
import {
  listen, map, filter, forEach
} from "bruh/util/iterable/async"

import {
  tau,
  normalizeAngle,
  SVGCoordinatesToAngle
} from "./math.mjs"
import { endAngleToNumber } from "./numbers.mjs"
import { dialNumber } from "./display.mjs"


const dial =
  circle({
    cx: 100/2,
    cy: 100/2,
    r:  100/2,
    fill: "gray",
    mask: "url(#holes)"
  })
  .toNode()

const eventToSVGCoordinates = event => {
  const rect = dial.getBoundingClientRect()
  return [
    100 * (event.x - rect.left) / rect.width,
    100 * (event.y - rect.top ) / rect.height
  ]
}

dial.style.setProperty("cursor", "grab")

let endAngle = 0

const goBack = () => {
  if (endAngle == 0)
    return

  endAngle = Math.max(0, endAngle - tau/100)
  dial.style.setProperty(
    "transform", `rotate(${endAngle}rad)`
  )

  requestAnimationFrame(goBack)
}

dial.addEventListener("pointerdown", downEvent => {
  if (endAngle != 0)
    return

  dial.style.setProperty("cursor", "grabbing")

  const grabAngle = normalizeAngle(
    SVGCoordinatesToAngle(
      eventToSVGCoordinates(downEvent)
    )
  )

  let lastAngle, lastValidAngle = grabAngle

  const moveEventStream = listen(document, "pointermove")

  pipe(
    moveEventStream,

    filter(moveEvent =>
      moveEvent.pointerId == downEvent.pointerId
    ),

    map(moveEvent =>
      SVGCoordinatesToAngle(
        eventToSVGCoordinates(moveEvent)
      )
    ),

    map(angle => normalizeAngle(angle, lastAngle)),

    filter(angle => {
      const validMovement =
        angle < lastAngle &&
        angle > 0 &&
        angle < lastValidAngle
      lastAngle = angle
      return validMovement
    }),

    forEach(angle => {
      lastValidAngle = angle
      endAngle = -(angle - grabAngle)
      dial.style.setProperty(
        "transform", `rotate(${endAngle}rad)`
      )
    })
  )

  const onUp = upEvent => {
    if (upEvent.pointerId != downEvent.pointerId)
      return

    release()
  }

  const release = () => {
    dial.style.setProperty("cursor", "grab")

    if (endAngle > 0.05 * tau)
      dialNumber(
        endAngleToNumber(endAngle)
      )

    requestAnimationFrame(goBack)

    moveEventStream.stop()
    document.removeEventListener("pointerup", onUp)
  }

  document.addEventListener("pointerup", onUp)
})

export default dial
