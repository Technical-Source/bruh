// Find how to change a source array into a target array, minimizing removals
export const compare = (source, target) => {
  // Set every item of a size (a+1)*(b+1) matrix except for
  // the first row and column, which are both filled with 0
  const m = Array.from(
    Array(source.length+1),
    () => Array(target.length+1).fill(0)
  )

  for (let i = 1; i <= source.length; i++)
  for (let j = 1; j <= target.length; j++)
    m[i][j] =
      source[i-1] === target[j-1]
        // If the corresponding array items match,
        // set the item to be one more than
        // its upper left diagonal neighbor
        ? m[i-1][j-1] + 1
        // If they don't match,
        // set the item to be the largest of
        // its top or left neighbors
        : m[i-1][j] > m[i][j-1]
            ? m[i-1][j  ]
            : m[i  ][j-1]

  // Now we trace backwards from the bottom right corner
  // to the top left corner (we will return the reverse)
  const changes = []

  let i = source.length
  let j = target.length
  while (i > 0 && j > 0) switch (m[i][j]) {
    // When the left neighbor was this items source,
    // that corresponds to an insertion
    case m[i  ][j-1]:
      changes.push({ insert: target[j-1] })
      j--
      break

    // When the top neighbor was this item's source,
    // that corresponds to a removal
    case m[i-1][j  ]:
      changes.push({ remove: source[i-1] })
      i--
      break

    // When the upper left diagonal neighbor was
    // this item's source, the item was unchanged
    // That means that it is part of the LCS
    case m[i-1][j-1] + 1:
      changes.push({ keep: source[i-1] })
      i--
      j--
  }

  // Account for any initial removals or insertions
  for (; i > 0; i--)
    changes.push({ remove: source[i-1] })
  for (; j > 0; j--)
    changes.push({ insert: target[j-1] })

  return changes.reverse()
}

const compareFast = (source, target) => {
  const [a, b, insert, remove] =
    source.length < target.length
      ? [source, target, "insert", "remove"]
      : [target, source, "remove", "insert"]

  const Δ = b.length - a.length

  // [-(|a|+1) ... 0 ...  |b|+1]
  const furthestPoints = Array(1+a.length + 1 + b.length+1).fill(-1)
  const changes = []

  // diagonal k has vertices (x, y) where k = y - x
  // there are diagonals ranging from -a.length to b.length
  // diagonal 0 starts with the source (0, 0)
  // diagonal Δ ends with the sink (a.length, b.length)
  const snake = k => {
    // diagonal below k
    const yBelow = furthestPoints[k-1] + 1
    // diagonal above k
    const yAbove = furthestPoints[k+1]

    let x, y
    if (yBelow > yAbove) {
      y = yBelow
      x = y - k
      changes[k] = [...changes[k-1] || [], { [insert]: b[y] }]
    }
    else {
      y = yAbove
      x = y - k
      changes[k] = [...changes[k+1] || [], { [remove]: a[x] }]
    }

    while (x < a.length && y < b.length && a[x+1] === b[y+1]) {
      changes[k].push({ keep: a[x+1] })
      x++
      y++
    }

    furthestPoints[k] = y
  }

  // p = (d-Δ)/2 where d is the number of insertions and removals
  // We only need to examine diagonals from 0-p to Δ+p because vertices
  // outside of the band from the source-p diagonal to sink+p diagonal
  // by definition cannot have a shorter path than vertices within the p-band
  for (let p = 0; furthestPoints[Δ] !== b.length; p++) {
    // Examine diagonals from -p up to Δ-1
    for (let k = -p;    k < Δ; k++)
      snake(k)

    // Examine diagonals from Δ + p down to Δ+1
    for (let k = Δ + p; k > Δ; k--)
      snake(k)

    // Examine the diagonal at Δ
    snake(Δ)
  }

  return changes[Δ].slice(1, -1)
}
