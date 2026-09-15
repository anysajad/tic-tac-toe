export type Listener<T> = (state: T) => void

export type Store<T> = {
  readonly get: () => T
  readonly set: (nextState: T) => void
  readonly subscribe: (listener: Listener<T>) => () => void
}

export function createStore<T>(initialState: T): Store<T> {
  let state = initialState
  const listeners = new Set<Listener<T>>()

  return {
    get: () => state,
    set: (nextState) => {
      state = nextState

      for (const listener of listeners) {
        listener(state)
      }
    },
    subscribe: (listener) => {
      listeners.add(listener)

      return () => {
        listeners.delete(listener)
      }
    },
  }
}
