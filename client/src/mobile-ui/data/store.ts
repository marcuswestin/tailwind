import { proxy, subscribe } from 'valtio'
import { ScreenStack } from '../navigation/ValtioStoreNavigation'
import { Offer } from '@duffel/api'
import { makeURLHashNavigation } from '../navigation/URLHashNavigation'

export function proxyWithPersist<DataT extends {}>(
  persistKey: string,
  initialState: DataT,
): { store: ReturnType<typeof proxy<DataT>>; clearPersistedState: () => void } {
  const store = loadStore()

  subscribe(store, () => {
    let json = JSON.stringify(store)
    localStorage.setItem(persistKey, json)
  })

  return {
    store,
    clearPersistedState() {
      localStorage.removeItem(persistKey)
      window.location.reload()
    },
  }

  function loadStore() {
    let state = {}
    try {
      // throw Error('No state persisted')
      let json = localStorage.getItem(persistKey)
      if (!json) {
        throw Error('No state persisted')
      }
      Object.assign(state, initialState, JSON.parse(json))
    } catch (e) {
      state = proxy<DataT>(initialState)
    }
    return proxy<DataT>(state as any)
  }
}

const persistKey = 'store-dev'
export const { store, clearPersistedState } = proxyWithPersist<Store>(persistKey, {
  // Initial state:
  screenStack: [],
  offersRequest: new Promise(resolve => resolve([])),
})

export const ephemeralStore = proxy<{
  pendingRequests: Promise<any>[]
}>({
  pendingRequests: [],
})

type Store = {
  readonly screenStack: ScreenStack
  offersRequest: Promise<Offer[]>
}

// export const Navigation = makeValtioStoreNavigation(store.screenStack)
// export const Navigation = makeURLHistoryNavigation(store.screenStack)
export const Navigation = makeURLHashNavigation()

export default store
