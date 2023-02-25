import { clearPersistedState, ephemeralStore } from '../data/store'
import { Button, Col, Row } from '../ui-lib'

export default function () {
  return (
    <Col
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#eee',
        borderRadius: '0 0 0 10px',
        padding: 10,
      }}>
      <Button onClick={clearPersistedState}>Clear store state</Button>
      <Row>Requests: {ephemeralStore.pendingRequests.length}</Row>
    </Col>
  )
}
