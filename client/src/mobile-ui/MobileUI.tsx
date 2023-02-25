// YES! Suspense works. Errors work. Request caching works.
//
// TODO: Cleanup - Suspend api.bookOffer function
//
// TODO: Cleanup - SearchResultsScreen and SearchResultsScreen3
//
// TODO: Cleanup - don't require wrapping function calls in initializeDataReader
//
// TODO: Cleanup - rename SearchResultsScreen to e.g FindFlightsScreen, and SearchScreen to StartTravelScreen or NewSearchScreen
//
// TODO: Cleanup - make path names better - skip the CamelCasing
//
// TODO: Get eslint to update on rules change. Also, figure out why it can't extend a local file.
//       Consider switching from React eslint settings to a locally depended eslint and prettier setup.
//
// TODO: Get eslint exhaustive switch statement checks to work
//
// TODO: Consider enabling eslints in package.json: "prefer-const", "@typescript-eslint/no-non-null-assertion"
//
// Reference resources:
//    - https://dev.to/andreiduca/practical-implementation-of-data-fetching-with-react-suspense-that-you-can-use-today-273m
//
//    - https://github.com/facebook/react/issues/17526#issuecomment-769151686
//        - https://github.com/facebook/react/issues/20877
//        - https://github.com/facebook/react/issues/24935
//        - https://dev.to/heyitsarpit/suspense-in-react-18-4ca0
//        - https://17.reactjs.org/docs/concurrent-mode-suspense.html
//            - "Can Proxies help express lazy-loaded APIs without inserting read() calls everywhere?"
//
//    - Cache with something like this in API layer:
//        - https://github.com/puleos/object-hash//
//
// TODO: API methods should be wrapped, to have either suspend-default - e.g
//       api.search() and search.search.now() - or suspendable - e.g
//       api.search.suspend() and api.search()
//
// TODO: Make underlying API use mini-RPC library
//       (See lib-api/* in https://github.com/marcuswestin/hugson-palleys)
//
// TODO: Remove SearchLoadingScreen, and have other loading screens also use
//       the suspended data reading API
//
// TODO: Consider copying and porting URLHashNavigation to URLHistoryNavigation
// ALSO: Consider copying and porting things learned in URLHashNavigation to ValtioStoreNavigation
//
// TODO: Either remove or clean up and document clear use of useAsyncFn, useAsyncErrorHandler and useErrorHandler
//
// TODO: Remove all API error handler functions
//
// TODO: Consider creating cache keys with something like
//       https://github.com/puleos/object-hash/ instead of JSON.stringify

import DevMenu from './components/DevMenu'
import { ErrorBoundary } from './data/Log'
import { Navigation } from './data/store'
import { loadScreenStack } from './mobile-init'
import { Box, Col, Tappable } from './ui-lib'
import { CanvasLight } from './ui-theme'
import { WelcomeScreen } from './1-WelcomeScreen'

window.addEventListener('unhandledrejection', error => {
  console.log('UNHANDLED PROMISE REJECTION', error)
})

window.addEventListener('rejectionhandled', error => {
  console.log('UNHANDLED PROMISE REJECTION NOW HANDLED', error)
})

loadScreenStack()
Navigation.load(WelcomeScreen)

export function MobileUI() {
  return (
    <Col
      style={{
        height: '100vh',
        maxWidth: 460,
        margin: '0 auto',
        background: CanvasLight,
      }}>
      <DevMenu />
      <ErrorBoundary fallback="Something went wrong">
        <UIContent />
      </ErrorBoundary>
    </Col>
  )
}

// window.addEventListener('popstate', e => {})

function UIContent() {
  let backButton = Navigation.useCanPop() && (
    <Tappable onClick={_event => Navigation.popScreen()}>
      <Box style={{ padding: 10 }}>{'< Back'}</Box>
    </Tappable>
  )

  console.log('RENDER UICONTENT')

  return (
    <Col style={{ flexGrow: 1, position: 'relative' }}>
      {backButton}
      {Navigation.useCurrent()}
    </Col>
  )
}
