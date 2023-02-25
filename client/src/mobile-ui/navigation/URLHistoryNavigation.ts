// TODO: Add a way for react UI using useCurrent to re-render on 'hashchange' event,
// instead of passing in a screenStack (since the screen stack is implicit in the browser
// navigation history).

// TODO: Load current screen from URL on page load

import React, { useEffect, useState } from 'react'
import { useSnapshot } from 'valtio'

export type ScreenStack = unknown[] // Opaque

export function makeURLHistoryNavigation(screenStackRaw: ScreenStack) {
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
  const screenStack: ScreenStackInternal = screenStackRaw as ScreenStackInternal
  const screenFns: Record<string, ScreenStackInternal[number]['screen']['screenFn']> = {}

  function encodeURL(screen: any, props: any) {
    return '?' + screen.screenName + '=' + encodeURIComponent(JSON.stringify(props || {}))
  }

  function decodeURL() {
    let str = window.location.search.substring(1)
    let [screenName, paramsStr] = str.split('=')
    let props = JSON.parse(decodeURIComponent(paramsStr))
    return { screen: { screenName, screenFn: screenFns[screenName] }, props }
    // let params = paramsStr.split('&').map(paramStr => {
    //   let [keyStr, valStr] = paramStr
    // })
    // console.log('HERE', screenName)

    // let data = window.location.hash.substring(start)
    // if (!params['nav_props']) {
    //   return {}
    // }
    // return
  }

  const nav = {
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
      // let snap = useSnapshot(screenStack)
      // if (snap.length) {
      //   let navScreen = snap[snap.length - 1]
      //   console.log('NAV', navScreen)
      // }
      let { screen, props } = decodeURL()
      return React.createElement(screen.screenFn, props)
      //   let snap = useSnapshot(screenStack)
      //   if (snap.length) {
      //     let navScreen = snap[snap.length - 1]
      //     let screenFn = screenFns[navScreen.screen.screenName]
      //     return React.createElement(screenFn, navScreen.props)
      //   } else {
      //     return React.createElement('div', {
      //       children: ['Empty navigation stack'],
      //     })
      //   }
    },

    useScreens() {
      return useSnapshot(screenStack).map(navScreen => {
        let screenFn = screenFns[navScreen.screen.screenName]
        return React.createElement(screenFn, navScreen.props)
      })
    },

    useCanPop() {
      return false
      let snap = useSnapshot(screenStack)
      return snap.length > 1
    },

    isEmpty() {
      return screenStack.length === 0
    },

    pushScreen: function <
      Props extends {},
      ScreenFn extends ScreenFnT<Props>,
      Screen extends NamedScreen<ScreenFn, Props>,
    >(screen: Screen, props?: Props) {
      // window.location.hash = encodeURL(screen, props)
      window.history.pushState(null, '', encodeURL(screen, props))
      updateUI()
      //   screenStack.push({ screen, props: props || {} })
      // screenStack = [{ screen, props }]
    },

    popScreen: function () {
      window.history.back()
    },

    replaceCurrentScreen: function <
      Props extends {},
      ScreenFn extends ScreenFnT<Props>,
      Screen extends NamedScreen<ScreenFn, Props>,
    >(screen: Screen, props?: Props) {
      // this.popScreen()
      // this.pushScreen(screen, props)
      window.history.replaceState(null, '', encodeURL(screen, props))
      updateUI()
      // window.location.hash = encodeURL(screen, props)
    },

    setScreen: function <
      Props extends {},
      ScreenFn extends ScreenFnT<Props>,
      Screen extends NamedScreen<ScreenFn, Props>,
    >(screen: Screen, props?: Props) {
      screenStack.splice(0, screenStack.length)
      this.pushScreen(screen, props)
    },

    setScreenStack: function (newScreenStackRaw: ScreenStack) {
      let newScreenStackInternal = newScreenStackRaw as ScreenStackInternal
      newScreenStackInternal.forEach(navScreen => {
        // TODO: This is hacky. Instead, remove screenFn from screen objects.
        let screenName = navScreen.screen.screenName
        if (!screenFns[screenName]) {
          throw new Error('Unknown screen name: ' + screenName)
        }
        navScreen.screen.screenFn = screenFns[screenName]
      })
      let newScreenStack = newScreenStackRaw as ScreenStackInternal
      screenStack.splice(0, newScreenStackRaw.length, ...newScreenStack)
    },
  } as const

  window.addEventListener('popstate', updateUI)
  function updateUI() {
    let { screen, props } = decodeURL()
    console.log('CHANGE!', screen.screenName, props)
    // screenStack.splice(0, screenStack.length)
    // screenStack.push({ screen, props })

    // nav.setScreen(screenFn, params)
    // screenStack.push({} as any)
    // screenStack.pop()
  }

  return nav
}
