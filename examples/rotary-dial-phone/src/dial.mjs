import { circle } from "bruh/dom/svg"
import { dispatch } from "bruh/util"

import {
  tau,
  normalizeAngle,
  SVGCoordinatesToAngle
} from "./math.mjs"
import { endAngleToNumber } from "./numbers.mjs"


const dial =
  circle({
    cx: 100/2,
    cy: 100/2,
    r:  100/2,
    fill: "gray",
    mask: "url(#holes)"
  })
  .toNode()

// Translate events with coordinates relative to the document
// into coordinates in our svg
const eventToSVGCoordinates = event => {
  const rect = dial.getBoundingClientRect()
  return [
    100 * (event.x - rect.left) / rect.width,
    100 * (event.y - rect.top ) / rect.height
  ]
}

dial.style.setProperty("cursor", "grab")

let endAngle = 0

// Rotate the dial back to the starting position
const goBack = () => {
  if (endAngle == 0)
    return

  endAngle = Math.max(0, endAngle - tau/100)
  dial.style.setProperty(
    "transform", `rotate(${endAngle}rad)`
  )

  requestAnimationFrame(goBack)
}

dial.addEventListener("pointerdown", async downEvent => {
  if (endAngle != 0)
    return

  dial.style.setProperty("cursor", "grabbing")

  // We need to record the angle of the finger (cursor/any pointer device)
  // when it first grabbed the dial
  const grabAngle = normalizeAngle(
    SVGCoordinatesToAngle(
      eventToSVGCoordinates(downEvent)
    )
  )

  // Keeping track of the last angle and last (valid) angle
  let lastAngle, lastValidAngle = grabAngle

  const onMove = moveEvent => [moveEvent]
    // We only care about move events from the same pointer that grabbed the dial
    .filter(moveEvent =>
      moveEvent.pointerId == downEvent.pointerId
    )

    // Get the angle of pointer
    .map(moveEvent =>
      SVGCoordinatesToAngle(
        eventToSVGCoordinates(moveEvent)
      )
    )

    // We normalize the angle relative to the last recorded angle, so that angle math is easier
    .map(angle => normalizeAngle(angle, lastAngle))

    // We only want to accept movements clockwise up to the finger stopper
    .filter(angle => {
      const validMovement =
        angle < lastAngle &&
        angle > 0 &&
        angle < lastValidAngle
      lastAngle = angle
      return validMovement
    })

    // If the movement was valid, we record that and rotate the dial
    .forEach(angle => {
      lastValidAngle = angle
      endAngle = -(angle - grabAngle)
      dial.style.setProperty(
        "transform", `rotate(${endAngle}rad)`
      )
    })

  const onUp = upEvent => {
    // Make sure we are talking about the same pointer that was grabbing the dial
    if (upEvent.pointerId != downEvent.pointerId)
      return

    dial.style.setProperty("cursor", "grab")

    // We dial the number if the dial was moved far enough to bother
    if (endAngle > 0.05 * tau)
      dispatch(dial, "dialed-number", {
        detail: endAngleToNumber(endAngle)
      })

    requestAnimationFrame(goBack)

    // Close this move event listener
    document.removeEventListener("pointermove", onMove)
  }

  document.addEventListener("pointermove", onMove)
  document.addEventListener("pointerup", onUp, { once: true })
})

export default dial
