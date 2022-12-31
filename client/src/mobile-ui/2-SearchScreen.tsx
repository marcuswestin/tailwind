import { Offer } from '@duffel/api'
import { proxy, useSnapshot } from 'valtio'
import { SearchCard } from '../default-duffel-app/examples/SearchCard'
import { Box, Button, Col, Row } from './ui-lib'
import { CanvasLight, FillLight, InkDark } from './ui-theme'
import { Suspense, useState } from 'react'
import AutocompleteInput from './components/AutocompleteInput'
import { AutocompleteOption } from './components/AutocompleteInput-utils'
import { SearchLoadingScreen } from './3-SearchLoadingScreen'
import { SearchResultsScreen } from './4-SearchResultsScreen'
import { Navigation } from './data/store'
import { net } from './data/net'

type SearchStore = {
  searchType: 'One way' | 'Round trip' | 'Multi-city'
  fromAirport: AutocompleteOption | null
  toAirport: AutocompleteOption | null
  airportOptions: Promise<AutocompleteOption[]>
}

const airportsData: Promise<Airport[]> = fetch('/data/airports.json').then(
  res => res.json(),
)

let uiStore = proxy<SearchStore>({
  searchType: 'One way',
  fromAirport: null,
  toAirport: null,
  airportOptions: airportsData.then((airportsRaw: Airport[]) => {
    return airportsRaw
      .filter(airport => airport.iata_code !== null)
      .map(airport => ({ id: airport.iata_code, label: airport.name }))
  }),
})

type Airport = typeof airportExample
const airportExample = {
  name: 'Hartsfield Jackson Atlanta Intl',
  city: 'Atlanta',
  country: 'United States',
  iata_code: 'ATL',
  _geoloc: {
    lat: 33.636719,
    lng: -84.428067,
  },
  links_count: 1826,
  objectID: '3682',
}


const inputStyles = {
  borderColor: InkDark,
  color: InkDark,
  padding: '8px 18px',
  borderRadius: 6,
}

export default Navigation.makeScreen('SearchScreen', function () {
  return (
    <Suspense fallback={<div>Loading!</div>}>
      <LoadedSearchScreen />
    </Suspense>
  )
})

function LoadedSearchScreen() {
  let snap = useSnapshot(uiStore)
  let [fromText, setFromAirport] = useState('')
  let [toText, setToAirport] = useState('')

  return (
    <Col style={{ gap: 12 }}>
      <Box style={{ alignSelf: 'center', fontWeight: 'bold' }}>
        Search flights
      </Box>
      <SearchCard
        beforeSearch={function (): void {}}
        onSuccess={function (offer: Offer): void {}}
        onError={function (e: Error): void {}}
      />
      <Row style={{ justifyContent: 'space-between', flexGrow: 0, gap: 0 }}>
        <SearchType searchType="One way" />
        <SearchType searchType="Round trip" />
        <SearchType searchType="Multi-city" />
      </Row>

      {snap.fromAirport?.id}
      <AutocompleteInput
        allowEnterFill
        allowTabFill
        options={snap.airportOptions}
        onSelect={value => (uiStore.fromAirport = value)}>
        <input
          onChange={e => {
            uiStore.fromAirport = null
            setFromAirport(e.target.value)
          }}
          value={fromText}
          style={inputStyles}
          placeholder="Fly from ..."
        />
      </AutocompleteInput>

      {snap.toAirport?.id}
      <AutocompleteInput
        allowEnterFill
        allowTabFill
        options={snap.airportOptions}
        onSelect={value => (uiStore.toAirport = value)}>
        <input
          onChange={e => {
            uiStore.toAirport = null
            setToAirport(e.target.value)
          }}
          value={toText}
          style={inputStyles}
          placeholder="Fly to ..."
        />
      </AutocompleteInput>

      <SearchInput text="Mon, February 6, 2023" />
      <SearchInput text="1 Passenger" />
      <Button
        style={{
          marginTop: 'auto',
        }}
        onClick={async () => {
          let [origin, destination] = [
            uiStore.fromAirport!.id as string,
            uiStore.toAirport!.id as string,
          ]

          // TODO: This should either be marked as non-poppable,
          // or detact popScreen happening during request and if so
          // cancel the request and following replaceCurrentScreen below.
          Navigation.pushScreen(SearchLoadingScreen, {
            from: origin,
            to: destination,
          })

          const sort = 'total_amount' || 'total_duration'
          const res = await net.post('/api/search', {
            origin,
            destination,
            sort,
          })
          const { offers, errors } = res
          if (errors) {
            console.log(errors)
            return
          }

          Navigation.pushScreen(SearchResultsScreen, { offers })
        }}>
        <div style={{ padding: 10 }}>Search</div>
      </Button>
    </Col>
  )
}

function SearchType({ searchType }: { searchType: SearchStore['searchType'] }) {
  let snap = useSnapshot(uiStore)
  let background = searchType === snap.searchType ? FillLight : CanvasLight
  return (
    <Box
      onClick={function () {
        uiStore.searchType = searchType
      }}
      style={{
        cursor: 'pointer',
        border: `1px solid ${InkDark}`,
        color: InkDark,
        background,
        padding: '8px 14px',
        borderRadius: 20,
      }}>
      {searchType}
    </Box>
  )
}

function SearchInput({ text }: { text: string }) {
  return (
    <input
      value={text}
      style={{
        borderColor: InkDark,
        color: InkDark,
        padding: '8px 18px',
        borderRadius: 6,
      }}
    />
  )
}
