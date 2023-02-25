import { Offer } from '@duffel/api'
import { Navigation } from './data/store'
import { formatCurrency } from '../utils'
import { Suspense } from 'react'
import { Button, Col, Row } from './ui-lib'
import duffelAPI, { initializeDataReader } from './data/duffelAPI'
import OrderConfirmationScreen from './5-OrderConfirmationScreen'
import { useAsyncFn } from './ui-util'
import SearchLoadingScreen from './3-SearchLoadingScreen'

export default Navigation.makeScreen('SearchResultsScreen', function (params: { offers: Offer[] }) {
  return SearchResultsUI(params)
})

export let SearchResultsScreen3 = Navigation.makeScreen(
  'SearchResultsScreen3',
  function (params: { origin: string; destination: string; sort: string }) {
    const offers = initializeDataReader(duffelAPI.search, params)()
    return <SearchResultsUI offers={offers} />
  },
)

function SearchResultsUI(props: { offers: Offer[] }) {
  return (
    <Col>
      <Suspense fallback={'Booking flight...'}>
        {props.offers.map(offer => {
          return <OfferView key={offer.id} offer={offer} />
        })}
      </Suspense>
    </Col>
  )
}

let OfferView = function ({ offer }: { offer: Offer }) {
  return (
    <Col style={{ flexShrink: 1 }}>
      <Row style={{ flexGrow: 0, marginBottom: 10 }}>
        <img src={getAirlineLogoUrl(offer.owner.iata_code)} alt={offer.owner.name} width={24} height={24} />
        {offer.owner.name}
      </Row>
      {formatCurrency(offer.total_amount, offer.total_currency)}
      <Button
        onClick={useAsyncFn(async () => {
          Navigation.pushScreen(SearchLoadingScreen, { message: 'Booking flight...' })
          let order = await duffelAPI.bookOffer(offer, error => {
            console.log('BOOK ERROR', error)
            Navigation.replaceCurrentScreen(SearchLoadingScreen, {
              message: 'Error: ' + (error as any).toString(),
            })
          })
          Navigation.replaceCurrentScreen(OrderConfirmationScreen, { order })
        })}>
        Book!
      </Button>
    </Col>
  )
}

function getAirlineLogoUrl(iataCode: string) {
  return `https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/${iataCode}.svg`
}
