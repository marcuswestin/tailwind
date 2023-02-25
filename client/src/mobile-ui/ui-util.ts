import { useCallback, useState } from 'react'

export function useErrorHandler() {
  const [_, setError] = useState()
  return useCallback(
    (e: any) => {
      console.log('In errorHandler:', e)
      setError(() => {
        throw e
      })
      console.log('In errorHandler, after setError')
    },
    [setError],
  )
}

export function useAsyncErrorHandler() {
  const [_, setError] = useState()
  return useCallback(
    (e: any) => {
      setError(() => {
        throw e
      })
    },
    [setError],
  )
}

export function useAsyncFn<T>(handler: (arg: T) => Promise<void>) {
  let errorHandler = useAsyncErrorHandler()

  return async function (arg: T) {
    try {
      let res = await handler(arg)
      return res
    } catch (error) {
      errorHandler(error)
    }
  }
}
