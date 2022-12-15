import { useEffect } from 'react'
import store from './data/store'
import { Button, Col } from './ui-lib'

export function SearchLoadingScreen() {
  useEffect(() => {
    let timeout = setTimeout(() => {
      store.screen.navigateTo('SearchResultScreen')
    }, 1000)
    return () => clearTimeout(timeout)
  })

  return (
    <Col
      style={{ justifyContent: 'center', textAlign: 'center' }}
      onClick={() => {
        store.screen.navigateTo('SearchResultScreen')
      }}>
      Searching 100s of flights...
      <Button onClick={() => store.screen.navigateTo('SearchResultScreen')}>
        Continue
      </Button>
    </Col>
  )
}
