import store from './data/store'
import { Button, Screen } from './ui-lib'

export function WelcomeScreen() {
  return (
    <Screen>
      <h1>Tailwind</h1>

      <Button
        onClick={() => {
          store.screen.navigateTo('SearchScreen')
        }}>
        Begin flying
      </Button>
    </Screen>
  )
}
