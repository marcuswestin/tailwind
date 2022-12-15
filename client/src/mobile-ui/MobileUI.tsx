import store from './data/store'
import { Col } from './ui-lib'
import { CanvasLight } from './ui-theme'

store.screen.navigateTo(
  'SearchLoadingScreen' ||
    'SearchScreen' ||
    // comment here to prevent auto formatting
    'WelcomeScreen',
)

export function MobileUI() {
  let CurrentScreen = store.screen.useCurrent()
  return (
    <Col
      style={{
        height: '100vh',
        maxWidth: 460,
        margin: 'auto',
        background: CanvasLight,
      }}>
      <Col style={{ flexGrow: 1, padding: 32 }}>
        <CurrentScreen />
      </Col>
    </Col>
  )
}
