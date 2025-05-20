// https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#space-separated-tokens
export const spaceSeparated: {
  (s: string): string[]
  (s?: null): undefined
  (s?: string | null): string[] | undefined
} = (s?: string | null) =>
  s?.trim().split(/\s+/) ?? undefined as any
