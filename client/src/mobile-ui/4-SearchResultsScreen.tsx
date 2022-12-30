import { Navigation } from './data/store'

export let SearchResultsScreen = Navigation.makeScreen(
  'SearchScreen',
  function (params: { offers: any[] }) {
    return (
      <div>
        {params.offers.map(offer => {
          return <div key={offer.id}>{JSON.stringify(offer)}</div>
        })}
      </div>
    )
  },
)
