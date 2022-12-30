import { proxy } from 'valtio'
import { makeNavigation } from './Navigation'

export const Navigation = makeNavigation({
  screenNames: [
    'WelcomeScreen',
    'SearchScreen',
    'SearchLoadingScreen',
    'SearchResultsScreen',
  ] as const,
})

type Store = {
  screenStack: typeof Navigation['screenStack']
}

export default proxy<Store>({
  screenStack: Navigation.screenStack,
})
