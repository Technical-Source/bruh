import { r, type MaybeReactive, getValue } from "../reactive/index.mts"
import { memo } from "../utils/index.mts"

/**
 * Prefer this over `{items.map()}`; it handles reactive and nonreactive iterables with arbitrary memo keys.
 * Memoization is scoped by [MemoMap, ...scope], so different MemoMaps won't collide even with the same items.
 *
 * ```tsx
 * <MemoMap
 *   items={maybeReactiveItems}
 *   scope={[maybeReactiveItems]} // Optional: defaults to [items]
 *   getKey={item => item} // Optional: defaults to the item itself
 * >
 *   {item =>
 *     <Item>{item}</Item> // Results are memoized within the scope by the key
 *   }
 * </MemoMap>
 * ```
 *
 * If rendering the same items in multiple different views, provide distinct scopes:
 * ```tsx
 * <MemoMap items={users} scope={[UserCard, users]}>{...}</MemoMap>
 * <MemoMap items={users} scope={[UserRow, users]}>{...}</MemoMap>
 * ```
 */
export const MemoMap = <
  In  extends unknown,
  Out extends unknown
>({
  items,
  scope = [items],
  getKey,
  children: f
}: {
  items: MaybeReactive<Iterable<In>>,
  /**
   * Defaults to [items]
   */
  scope?: ReadonlyArray<unknown>,
  /**
   * Defaults to the item itself
   */
  getKey?: (x: In) => unknown,
  children: (x: In) => Out
}) => {
  const memoF = memo(f, {
    scope: [MemoMap, ...scope],
    getKey
  })
  return r(() => Array.from(getValue(items), memoF))
}
