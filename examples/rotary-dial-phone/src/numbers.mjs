import {
  mask, g, circle, text
} from "bruh/dom/svg"

import {
  tau,
  angleToSVGCoordinates
} from "./math.mjs"

const numberPositions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
  .map((number, i) => {
    const start = 1/12 * tau
    const end = tau - start
    const angle = start + (i/9 * (end - start))

    const coordinates = angleToSVGCoordinates(angle, 40)

    return { number, angle, coordinates }
  })

export const numbers =
  g({ id: "numbers" },
    ...numberPositions
      .map(({ number, coordinates }) =>
        text({
          x: coordinates[0],
          y: coordinates[1] + 1,
          "alignment-baseline": "middle",
          "text-anchor": "middle"
        }, number)
      )
  )

export const holes =
  mask({ id: "holes" },
    circle({
      fill: "white",
      cx: 100/2,
      cy: 100/2,
      r:  100/2,
    }),
    ...numberPositions
      .map(({ number, coordinates }) =>
         circle({
           fill: "black",
           cx: coordinates[0],
           cy: coordinates[1],
           r: 7.5
         })
      )
  )

export const endAngleToNumber = endAngle =>
  numberPositions
    .reduce((previous, current) => 
      Math.abs( current.angle - endAngle) <
      Math.abs(previous.angle - endAngle)
        ? current
        : previous
    ).number
