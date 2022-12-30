import React from 'react'
import { proxy, useSnapshot } from 'valtio'

type ScreenFnT<ParamsT> = React.FC<ParamsT>

export function makeNavigation<
  ScreenNamess extends Readonly<Array<string>>,
>(props: { screenNames: ScreenNamess }) {
  type ScreenNames = typeof props.screenNames[number]

  type NamedScreen<ScreenFn extends ScreenFnT<Props>, Props extends {}> = {
    name: ScreenNames
    fn: ScreenFn
  }

  type NavScreen<
    Props extends {},
    ScreenFn extends ScreenFnT<Props>,
    Screen extends NamedScreen<ScreenFn, Props>,
  > = {
    screen: Screen
    props: Parameters<Screen['fn']>[0]
  }

  type ScreenStack = NavScreen<{}, any, any>[]
  const screenStack: ScreenStack = []

  const store = proxy({
    screenStack,

    useCurrent() {
      let screenSnap = useSnapshot(store)
      let screenStack = screenSnap.screenStack
      let navScreen = screenStack[screenStack.length - 1]
      return React.createElement(navScreen.screen.fn, navScreen.props)
    },

    canPop() {
      return store.screenStack.length > 1
    },

    makeScreen<Props extends {}, ScreenFn extends ScreenFnT<Props>>(
      name: ScreenNames,
      fn: ScreenFn,
    ): NamedScreen<ScreenFn, Props> {
      return { name, fn }
    },

    pushScreen: function <
      Props extends {},
      ScreenFn extends ScreenFnT<Props>,
      Screen extends NamedScreen<ScreenFn, Props>,
    >(screen: Screen, props?: Props) {
      store.screenStack.push({ screen, props: props || {} })
      // store.screenStack = [{ screen, props }]
    },

    popScreen: function () {
      store.screenStack.pop()
    },

    setScreen: function <
      Props extends {},
      ScreenFn extends ScreenFnT<Props>,
      Screen extends NamedScreen<ScreenFn, Props>,
    >(screen: Screen, props?: Props) {
      store.screenStack = []
      store.pushScreen(screen, props)
    },
  })

  return store
}
