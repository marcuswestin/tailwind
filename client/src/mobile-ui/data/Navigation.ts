import React from 'react'
import { proxy, useSnapshot } from 'valtio'

type ScreenFns<ParamsT> = React.FC<ParamsT>

export function makeNavigation<
  ScreenNamess extends Readonly<Array<string>>,
>(props: { screenNames: ScreenNamess }) {
  type ScreenNames = typeof props.screenNames[number]

  type NamedScreen<ScreenFn extends ScreenFns<Params>, Params extends {}> = {
    name: ScreenNames
    fn: ScreenFn
  }

  type NavScreen<
    Params extends {},
    ScreenFn extends ScreenFns<Params>,
    Screen extends NamedScreen<ScreenFn, Params>,
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

    makeScreen<Params extends {}, ScreenFn extends ScreenFns<Params>>(
      name: ScreenNames,
      fn: ScreenFn,
    ): NamedScreen<ScreenFn, Params> {
      return { name, fn }
    },

    pushScreen: function <
      Params extends {},
      ScreenFn extends React.FC<Params>,
      Screen extends NamedScreen<ScreenFn, Params>,
    >(screen: Screen, props?: Params) {
      store.screenStack.push({ screen, props: props || {} })
      // store.screenStack = [{ screen, props }]
    },

    popScreen: function () {
      store.screenStack.pop()
    },

    setScreen: function <
      Params extends {},
      ScreenFn extends React.FC<Params>,
      Screen extends NamedScreen<ScreenFn, Params>,
    >(screen: Screen, props?: Params) {
      store.screenStack = []
      store.pushScreen(screen, props)
    },
  })

  return store
}
