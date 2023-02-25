import { useState } from 'react'
import { proxy, useSnapshot } from 'valtio'
import { Col } from '../mobile-ui/ui-lib'

type Person = string

type Film = {
  name: string
  actors: Person[]
  directors: Person[]
}

type Store = {
  username?: string
  game: {
    movieStudio?: {
      name: string
      films: Film[]
      budget: number
    }
  }
}

let store = proxy<Store>({
  game: {},
})

// async function saveState() {
//   let data = JSON.stringify(store)
//   fetch({url: '/api/saveState'})
// }

export function GameUI() {
  let snap = useSnapshot(store)
  if (!snap.game.movieStudio) {
    return <SetupView />
  }
  return <MainUI />
}

function MainUI() {
  return <div></div>
}

function SetupView() {
  let [username, setUsername] = useState('')
  let [studioName, setStudioName] = useState('')
  return (
    <Col style={{ maxWidth: 300 }}>
      Username:
      <input
        type="text"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      Studio name:
      <input
        type="text"
        value={studioName}
        onChange={e => setStudioName(e.target.value)}
      />
      <button
        onClick={() => {
          store.username = username
          store.game.movieStudio = {
            name: studioName,
            films: [],
            budget: 100,
          }
        }}>
        Start
      </button>
    </Col>
  )
}
