import { proxy, subscribe } from 'valtio'
import { ScreenStack, makeNavigation } from './Navigation'

export function proxyWithPersist<DataT extends {}>(
  persistKey: string,
  initialState: DataT,
): ReturnType<typeof proxy<DataT>> {
  const store = loadStore()

  subscribe(store, () => {
    let json = JSON.stringify(store)
    localStorage.setItem(persistKey, json)
  })

  return store

  function loadStore() {
    try {
      let json = localStorage.getItem(persistKey)
      if (!json) {
        throw Error('No state persisted')
      }
      return proxy<DataT>(JSON.parse(json))
    } catch (e) {
      return proxy<DataT>(initialState)
    }
  }
}

const store = proxyWithPersist<Store>('store-dev', {
  // Initial state:
  screenStack: [],
})

type Store = {
  screenStack: ScreenStack
}

export const Navigation = makeNavigation(store.screenStack)

export default store
