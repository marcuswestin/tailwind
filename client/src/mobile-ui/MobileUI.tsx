import store from './data/store'
import { Col } from './ui-lib'
import { useSnapshot } from 'valtio'
import { CanvasLight } from './ui-theme'

export function MobileUI() {
  let storeSnap = useSnapshot(store)
  return (
    <Col
      style={{
        height: '100vh',
        maxWidth: 460,
        margin: 'auto',
        background: CanvasLight,
      }}>
      <Col
        style={{
          flexGrow: 1,
          padding: 32,
        }}>
        {storeSnap.view({})}
      </Col>
    </Col>
  )
}
