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
