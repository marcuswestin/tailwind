import { Navigation } from './data/store'
import { loadScreenStack } from './mobile-init'
import { Col } from './ui-lib'
import { CanvasLight } from './ui-theme'

loadScreenStack()

export function MobileUI() {
  let currentScreen = Navigation.useCurrent()
  let backButton = Navigation.canPop() && (
    <div onClick={Navigation.popScreen}>Back</div>
  )

  return (
    <Col
      style={{
        height: '100vh',
        maxWidth: 460,
        margin: 'auto',
        background: CanvasLight,
      }}>
      <Col style={{ flexGrow: 1, padding: 32 }}>
        {backButton}
        {currentScreen}
      </Col>
    </Col>
  )
}
