import { Order } from '@duffel/api'
import { Navigation } from './data/store'
import { Col } from './ui-lib'

export default Navigation.makeScreen('OrderConfirmationScreen', function (params: { order: Order }) {
  return <Col>{JSON.stringify(params.order)}</Col>
})
