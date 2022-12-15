import { proxy, useSnapshot } from 'valtio'
import { WelcomeScreen } from '../1-WelcomeScreen'
import { SearchScreen } from '../2-SearchScreen'
import { SearchLoadingScreen } from '../3-SearchLoadingScreen'
import { SearchResultsScreen } from '../4-SearchResultsScreen'

type View = React.FC

type ScreenName = keyof typeof screens
const screens = {
  WelcomeScreen: WelcomeScreen,
  SearchScreen: SearchScreen,
  SearchLoadingScreen: SearchLoadingScreen,
  SearchResultScreen: SearchResultsScreen,
}

type Store = {
  screen: {
    current: ScreenName
    navigateTo: (screenName: ScreenName) => void
    useCurrent(): View
  }
}

export default proxy<Store>({
  screen: {
    current: 'SearchLoadingScreen',
    navigateTo(screenName: ScreenName) {
      this.current = screenName
    },
    useCurrent() {
      let screenSnap = useSnapshot(this)
      return screens[screenSnap.current]
    },
  },
})
