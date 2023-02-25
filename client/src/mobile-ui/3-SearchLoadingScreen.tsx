import { Navigation } from './data/store'
import { Col } from './ui-lib'

export default Navigation.makeScreen('SearchLoadingScreen', function (props: { message: string }) {
  return <Col style={{ justifyContent: 'center', textAlign: 'center' }}>{props.message}</Col>
})
