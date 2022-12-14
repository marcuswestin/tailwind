import { proxy, useSnapshot } from 'valtio'
import { SearchLoadingScreen } from './3-SearchLoadingScreen'
import store from './data/store'
import { Box, Button, Col, Row } from './ui-lib'
import { CanvasLight, FillLight, InkDark } from './ui-theme'

type SearchStore = {
  searchType: 'One way' | 'Round trip' | 'Multi-city'
}
let uiStore = proxy<SearchStore>({
  searchType: 'One way',
})

export function SearchScreen() {
  return (
    <Col style={{ gap: 12 }}>
      <Box style={{ alignSelf: 'center', fontWeight: 'bold' }}>
        Search flights
      </Box>
      <Row style={{ justifyContent: 'space-between', flexGrow: 0, gap: 0 }}>
        <SearchType searchType="One way" />
        <SearchType searchType="Round trip" />
        <SearchType searchType="Multi-city" />
      </Row>
      <SearchInput text="New York, NY (All airports)" />
      <SearchInput text="Miami, FL (MIA)" />
      <SearchInput text="Mon, February 6, 2023" />
      <SearchInput text="1 Passenger" />
      <Button
        style={{
          marginTop: 'auto',
        }}
        onClick={() => {
          store.view = SearchLoadingScreen
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
