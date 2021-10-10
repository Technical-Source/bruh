declare const isReactive: unique symbol

export declare type Reactive<T> = {
  [isReactive]: true
  value: T
  addReaction: (reaction: Function) => Function
}

export declare class SimpleReactive<T> implements Reactive<T> {
  constructor(value: T)

  [isReactive]: true
  get value(): T
  set value(newValue: T)
  addReaction(reaction: Function): () => boolean
}

export declare class FunctionalReactive<T> implements Reactive<T> {
  constructor(value: T)
  constructor(dependencies: Array<FunctionalReactive<unknown>>, f: () => T)

  [isReactive]: true
  get value(): T
  set value(newValue: T)
  addReaction(reaction: Function): () => boolean
}

export declare const r: {
  <T>(value: T): FunctionalReactive<T>
  <T>(dependencies: Array<FunctionalReactive<unknown>>, f: () => T): FunctionalReactive<T>
}

export declare const reactiveDo: {
  <T>(reactive: Reactive<T>, f: (value: T) => unknown): Function
  <T>(value: T, f: (value: T) => unknown): void
}
