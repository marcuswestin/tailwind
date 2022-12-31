import { Offer } from '@duffel/api'
import { Navigation } from './data/store'

export let SearchResultsScreen = Navigation.makeScreen(
  'SearchResultsScreen',
  function (params: { offers: any[] }) {
    return (
      <div>
        {params.offers.map(offer => {
          return (
            <div key={offer.id}>
              <OfferView offer={offer} />
            </div>
          )
        })}
      </div>
    )
  },
)

let OfferView = function ({ offer }: { offer: Offer }) {
  return <div>{offer.id}</div>
}
