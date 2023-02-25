import { Offer, OfferPassenger, Order } from '@duffel/api'
import { net } from './net'
import Log from './Log'
import { ephemeralStore } from './store'
import { useSnapshot } from 'valtio'

interface SuspendedResult<T> {
  status: 'pending' | 'error' | 'resolved'
  data: T | null
  error: any | null
}

/**
 * This is our suspender function
 * that throws promise if it is not fulfilled yet
 */
export function suspend<T>(fn: () => Promise<T>) {
  /**
   * A promise tracker that will be updated
   * when promise resolves or rejects
   */
  const response: SuspendedResult<T> = {
    status: 'pending',
    data: null,
    error: null,
  }

  // suspenderPromise is the promise we will throw until
  //  so react can re-render when it is fulfilled
  const suspenderPromise = fn().then(
    res => {
      response.status = 'resolved'
      response.data = res
    },
    error => {
      response.status = 'error'
      response.error = error
    },
  )

  switch (response.status) {
    case 'pending':
      throw suspenderPromise
    case 'error':
      throw response.error
    case 'resolved':
      return response.data as T
    default:
      throw new Error('Should not get here')
  }
}

/// START CACHING
/////////////////

// a typical api function: takes an arbitrary number of arguments of type A
// and returns a Promise which resolves with a specific response type of R
type ApiFn<R, A extends any[] = []> = (...args: A) => Promise<R>

// an updater function: has a similar signature with the original api function,
// but doesn't return anything because it only triggers new api calls
type UpdaterFn<A extends any[] = []> = (...args: A) => void

// a simple data reader function: just returns the response type R
type DataFn<R> = () => R
// a lazy data reader function: might also return `undefined`
type LazyDataFn<R> = () => R | undefined

// we know we can also transform the data with a modifier function
// which takes as only argument the response type R and returns a different type M
type ModifierFn<R, M = any> = (response: R) => M

// therefore, our data reader functions might behave differently
// when we pass a modifier function, returning the modified type M
type ModifiedDataFn<R> = <M>(modifier: ModifierFn<R, M>) => M
type LazyModifiedDataFn<R> = <M>(modifier: ModifierFn<R, M>) => M | undefined

// finally, our actual eager and lazy implementations will use
// both versions (with and without a modifier function),
// so we need overloaded types that will satisfy them simultaneously
type DataOrModifiedFn<R> = DataFn<R> & ModifiedDataFn<R>
type LazyDataOrModifiedFn<R> = LazyDataFn<R> & LazyModifiedDataFn<R>

// // overload for wrapping an apiFunction without params:
// // it only takes the api function as an argument
// // it returns a data reader with an optional modifier function
// function initializeDataReader<ResponseType>(
//   apiFn: ApiFn<ResponseType>,
// ): DataOrModifiedFn<ResponseType>;

// // overload for wrapping an apiFunction with params:
// // it takes the api function and all its expected arguments
// // also returns a data reader with an optional modifier function
// function initializeDataReader<ResponseType, ArgTypes extends any[]>(
//   apiFn: ApiFn<ResponseType, ArgTypes>,
//   ...parameters: ArgTypes
// ): DataOrModifiedFn<ResponseType>;

// implementation that covers the above overloads
export function initializeDataReader<ResponseType, ArgTypes extends any[] = []>(
  apiFn: ApiFn<ResponseType, ArgTypes>,
  ...parameters: ArgTypes
) {
  // check if we have a cached data reader and return it instead
  const cache = resourceCache(apiFn, ...parameters)
  const cachedResource = cache.get()

  if (cachedResource) {
    return cachedResource
  }

  type AsyncStatus = 'init' | 'done' | 'error'

  let data: ResponseType
  let status: AsyncStatus = 'init'
  let error: any

  const fetcingPromise = apiFn(...parameters)
    .then(response => {
      data = response
      status = 'done'
    })
    .catch(e => {
      error = e
      status = 'error'
    })

  // // overload for a simple data reader that just returns the data
  // function dataReaderFn(): ResponseType
  // // overload for a data reader with a modifier function
  // function dataReaderFn<M>(modifier: ModifierFn<ResponseType, M>): M
  // // implementation to satisfy both overloads
  // function dataReaderFn<M>(modifier?: ModifierFn<ResponseType, M>) {
  //   if (status === 'init') {
  //     throw fetcingPromise
  //   } else if (status === 'error') {
  //     throw error
  //   }

  //   return typeof modifier === 'function' ? (modifier(data) as M) : (data as ResponseType)
  // }

  // overload for a simple data reader that just returns the data
  function dataReaderFn(): ResponseType
  // overload for a data reader with a modifier function
  function dataReaderFn<M>(modifier: ModifierFn<ResponseType, M>): M
  // implementation to satisfy both overloads
  function dataReaderFn<M>(modifier?: ModifierFn<ResponseType, M>) {
    if (status === 'init') {
      throw fetcingPromise
    } else if (status === 'error') {
      throw error
    }

    return typeof modifier === 'function' ? (modifier(data) as M) : (data as ResponseType)
  }

  cache.set(dataReaderFn)

  return dataReaderFn
}

const caches = new Map()

export function resourceCache<R, A extends any[]>(apiFn: ApiFn<R, A>, ...params: A | never[]) {
  // if there is no Map list defined for our api function, create one
  if (!caches.has(apiFn)) {
    caches.set(apiFn, new Map())
  }

  // get the Map list of caches for this api function only
  const apiCache: Map<string, DataOrModifiedFn<R>> = caches.get(apiFn)

  // "hash" the parameters into a unique key*
  const pKey = JSON.stringify(params)

  // return some methods that let us control our cache
  return {
    get() {
      return apiCache.get(pKey)
    },
    set(data: DataOrModifiedFn<R>) {
      return apiCache.set(pKey, data)
    },
    delete() {
      return apiCache.delete(pKey)
    },
    clear() {
      return apiCache.clear()
    },
  }
}

/// END CACHING

async function cmd(cmd: string, params: any) {
  console.log('CMD ', cmd)
  let req = net.post(`/api/` + cmd, params)
  ephemeralStore.pendingRequests.push(req)

  try {
    let res = await req
    console.info(cmd, 'res:', res)
    Log.assert(!res.errors, res.errors)
    return res
  } finally {
    removeItemFromArray(req, ephemeralStore.pendingRequests)
  }
}

export function useLoadingUI() {
  let snap = useSnapshot(ephemeralStore)
  return snap.pendingRequests.length > 0 ? <div>Loading...</div> : null
}

function removeItemFromArray<T>(item: T, array: T[]) {
  let index = array.indexOf(item)
  if (index !== -1) {
    array.splice(index, 1)
  }
}

export default {
  async search(
    params: { origin: string; destination: string; sort: string; passengers?: OfferPassenger[] },
    errorHandler?: (error: Error) => void,
  ) {
    try {
      const res = await cmd('search', params)
      // throw new Error('Fake error')
      return res.offers as Offer[]
    } catch (error) {
      errorHandler && errorHandler(error as Error)
      throw error
    }
  },
  async search2(params: {
    origin: string
    destination: string
    sort: string
    passengers?: OfferPassenger[]
  }) {
    const res = await cmd('search', params)
    return [res.offers as Offer[], res.errors as Error] as const
  },
  async bookOffer(offer: Offer, errorHandler: (error: unknown) => void) {
    // TODO: Remove try/catch, errorHandler, and make suspended
    try {
      const res = await cmd('book', {
        passengers: [
          {
            id: offer.passengers[0].id,
            born_on: '1987-07-24',
            family_name: 'Earheart',
            given_name: 'Amelia',
            gender: 'f',
            title: 'ms',
            email: 'amelia@duffel.com',
            phone_number: '+442080160509',
          },
        ],
        offerId: offer.id,
        currency: offer.total_currency,
        amount: offer.total_amount,
      })
      return res.order as Order
    } catch (error) {
      errorHandler(error as Error)
      throw error
    }
  },
}

export const formatCurrency = (value: string, currency: string) => {
  return Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency,
  }).format(+value)
}

export const getAirlineLogoUrl = (iataCode: string) =>
  `https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/${iataCode}.svg`
