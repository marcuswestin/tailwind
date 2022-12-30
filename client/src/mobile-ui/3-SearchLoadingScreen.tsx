import { Navigation } from './data/store'
import { Col } from './ui-lib'

export let SearchLoadingScreen = Navigation.makeScreen(
  'SearchLoadingScreen',
  function () {
    return (
      <Col style={{ justifyContent: 'center', textAlign: 'center' }}>
        Searching 100s of flights...
      </Col>
    )
  },
)
