import { WelcomeScreen } from './1-WelcomeScreen'
import store, { Navigation } from './data/store'

export function loadScreenStack() {
  try {
    if (Navigation.isEmpty()) {
      Navigation.setScreen(WelcomeScreen, {})
    } else {
      Navigation.setScreenStack(store.screenStack)
    }
  } catch (err) {
    Navigation.setScreenStack(store.screenStack)
  }
}
