import React from 'react'
import { useSnapshot } from 'valtio'

type ScreenFnT<ParamsT> = React.FC<ParamsT>

export type ScreenStack = unknown[] // Opaque

export function makeNavigation(screenStackRaw: ScreenStack) {
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
  const screenFns: Record<
    string,
    typeof screenStack[number]['screen']['screenFn']
  > = {}

  return {
    useCurrent() {
      let snap = useSnapshot(screenStack)
      if (snap.length) {
        let navScreen = snap[snap.length - 1]
        let screenFn = screenFns[navScreen.screen.screenName]
        return React.createElement(screenFn, navScreen.props)
      } else {
        return React.createElement('div', {
          children: ['Empty navigation stack'],
        })
      }
    },

    isEmpty() {
      return screenStack.length === 0
    },
    useCanPop() {
      let snap = useSnapshot(screenStack)
      return snap.length > 1
    },

    makeScreen<Props extends {}, ScreenFn extends ScreenFnT<Props>>(
      screenName: string,
      screenFn: ScreenFn,
    ): NamedScreen<ScreenFn, Props> {
      if (screenFns[screenName]) {
        throw new Error(
          `makeScreen: Duplicate screen screenName: ${screenName}`,
        )
      }
      screenFns[screenName] = screenFn
      return { screenName, screenFn }
    },

    pushScreen: function <
      Props extends {},
      ScreenFn extends ScreenFnT<Props>,
      Screen extends NamedScreen<ScreenFn, Props>,
    >(screen: Screen, props?: Props) {
      screenStack.push({ screen, props: props || {} })
    },

    popScreen: function () {
      screenStack.pop()
    },

    replaceCurrentScreen: function <
      Props extends {},
      ScreenFn extends ScreenFnT<Props>,
      Screen extends NamedScreen<ScreenFn, Props>,
    >(screen: Screen, props?: Props) {
      this.popScreen()
      this.pushScreen(screen, props)
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
        // TODO: This is hacky.
        // Instead, remove screenFn from screen objects.
        let screenName = navScreen.screen.screenName
        if (!screenFns[screenName]) {
          throw new Error('Unknown screen name: ' + screenName)
        }
        navScreen.screen.screenFn = screenFns[screenName]
      })
      let newScreenStack = newScreenStackRaw as ScreenStackInternal
      screenStack.splice(0, newScreenStackRaw.length, ...newScreenStack)
    },
  }
}
