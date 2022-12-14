import { proxy } from 'valtio'
import { WelcomeScreen } from '../1-WelcomeScreen'
import { SearchScreen } from '../2-SearchScreen'

type View = React.FC
type Store = {
  view: View
}

export default proxy<Store>({
  view:
    SearchScreen ||
    //
    WelcomeScreen,
})
