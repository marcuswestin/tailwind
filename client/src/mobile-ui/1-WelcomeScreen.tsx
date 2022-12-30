import SearchScreen from './2-SearchScreen'
import { Navigation } from './data/store'
import { Button, Screen } from './ui-lib'

export let WelcomeScreen = Navigation.makeScreen('WelcomeScreen', () => {
  return (
    <Screen>
      <h1>Tailwind</h1>

      <Button
        onClick={() => {
          Navigation.pushScreen(SearchScreen)
        }}>
        Begin flying
      </Button>
    </Screen>
  )
})
