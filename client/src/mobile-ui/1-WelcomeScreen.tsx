import { SearchScreen } from './2-SearchScreen'
import store from './data/store'
import { Button, Screen } from './ui-lib'

export function WelcomeScreen() {
  return (
    <Screen>
      <h1>Tailwind</h1>

      <Button
        onClick={() => {
          store.view = SearchScreen
        }}>
        Begin flying
      </Button>
    </Screen>
  )
}
