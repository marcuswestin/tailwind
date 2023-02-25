// TODO: Consider compressing state before storing in hash
// (see https://www.scottantipa.com/store-app-state-in-urls)

import React, { Suspense } from 'react'
import { ErrorBoundary } from '../data/Log'

export function makeURLHashNavigation() {
  type ScreenFnT<ParamsT> = React.FC<ParamsT>

  type NamedScreen<ScreenFn extends ScreenFnT<Props>, Props extends {}> = {
    screenName: string
    screenFn: ScreenFn
  }

  type NavScreen<
    Props extends {},
    ScreenFn extends ScreenFnT<Props>,
    Screen extends NamedScreen<ScreenFn, Props>,
  > = {
    screen: Screen
    props: Parameters<ScreenFn>[0]
  }

  type ScreenStackInternal = NavScreen<{}, any, NamedScreen<any, any>>[]
  const screenFns: Record<string, ScreenStackInternal[number]['screen']['screenFn']> = {}

  function encodeURL(screen: any, props: any) {
    return '#' + screen.screenName + '?' + encodeURIComponent(JSON.stringify(props || {}))
  }

  function decodeURL() {
    try {
      let str = window.location.hash.substring(1)
      let [screenName, paramsStr] = str.split('?')
      let props = JSON.parse(decodeURIComponent(paramsStr))
      return { screen: { screenName, screenFn: screenFns[screenName] }, props }
    } catch (err) {
      return { screen: defaultScreen, props: defaultProps || {} }
    }
  }

  function useForceUpdateOnHashChange() {
    const forceUpdate = React.useReducer(() => ({}), {})[1] as () => void

    React.useEffect(() => {
      window.addEventListener('hashchange', forceUpdate)
      return () => window.removeEventListener('hashchange', forceUpdate)
    }, [forceUpdate])
  }

  let defaultScreen: any = null
  let defaultProps: any = null

  const nav = {
    load: function <
      Props extends {},
      ScreenFn extends ScreenFnT<Props>,
      Screen extends NamedScreen<ScreenFn, Props>,
    >(loadDefaultScreen: Screen, loadDefaultProps?: Props) {
      if (defaultScreen) {
        throw new Error('Navigation loaded twice')
      }
      defaultScreen = loadDefaultScreen
      defaultProps = loadDefaultProps
    },

    makeScreen<Props extends {}, ScreenFn extends ScreenFnT<Props>>(
      screenName: string,
      screenFn: ScreenFn,
    ): NamedScreen<ScreenFn, Props> {
      if (screenFns[screenName]) {
        throw new Error(`makeScreen: Duplicate screen screenName: ${screenName}`)
      }
      screenFns[screenName] = screenFn
      return { screenName, screenFn }
    },

    useCurrent() {
      useForceUpdateOnHashChange()
      let { screen, props } = decodeURL()
      return React.createElement(ErrorBoundary, {
        fallback: `Something went wrong in ${screen.screenName}`,
        children: React.createElement(Suspense, {
          fallback: `Loading ${screen.screenName}`,
          children: React.createElement(screen.screenFn, props),
        }),
      })
    },

    useCanPop() {
      return false
      console.log('HERE', window.history.length)
      useForceUpdateOnHashChange()
      return window.history.length > 1
    },

    pushScreen: function <
      Props extends {},
      ScreenFn extends ScreenFnT<Props>,
      Screen extends NamedScreen<ScreenFn, Props>,
    >(screen: Screen, props?: Props) {
      window.location.hash = encodeURL(screen, props)
    },

    popScreen: function () {
      window.history.back()
    },

    replaceCurrentScreen: function <
      Props extends {},
      ScreenFn extends ScreenFnT<Props>,
      Screen extends NamedScreen<ScreenFn, Props>,
    >(screen: Screen, props: Props) {
      window.location.replace(encodeURL(screen, props))
    },
  } as const

  return nav
}
