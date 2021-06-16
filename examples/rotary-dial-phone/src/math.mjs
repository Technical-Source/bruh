export const tau = 2 * Math.PI

// Actual modulo instead of javascript remainder operator (%)
export const mod = (a, n) =>
  ((a % n) + n) % n

// Return the angle closest to the last angle
export const normalizeAngle = (angle, lastAngle) => {
  // With no previous angle as reference, return in [0, tau)
  if (lastAngle == undefined)
    return mod(angle, tau)

  const difference = mod(angle, tau) - mod(lastAngle, tau)
  const oppositeDifference = -Math.sign(difference) * (
    tau - Math.abs(difference)
  )
  const shorter =
    Math.abs(difference) < Math.abs(oppositeDifference)
      ? difference
      : oppositeDifference

  return lastAngle + shorter
}

export const angleToSVGCoordinates = (angle, distance) => {
  const x = Math.cos(angle) * distance
  const y = Math.sin(angle) * distance
  return [
           x + 100/2,
    100 - (y + 100/2)
  ]
}

export const SVGCoordinatesToAngle = coordinates => {
  const x =   coordinates[0]        - 100/2
  const y = -(coordinates[1] - 100) - 100/2
  return Math.atan2(y, x)
}
