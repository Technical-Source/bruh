export type PropertyWiseOr<
  A extends {},
  B extends {}
> = {
  [K in keyof (A & B)]
    : K extends keyof (A | B)
      ? (A | B)[K]
    : K extends keyof A
      ? A[K]
    : K extends keyof B
      ? B[K]
      : never
}

export type MaybePromise<T> = T | Promise<T>

export type LikelyAsString =
  string |
  number | bigint

/** Like `LikelyAsBoolean`, but `true` is treated as a missing value */
export type LikelyAsAbsent =
  null | undefined |
  // showSomething && something
  // hideSomething || something
  boolean

/** Like `LikelyAsAbsent`, but `true` is not treated as a missing value */
export type LikelyAsBoolean =
  boolean |
  // treated as false in this case
  null | undefined
