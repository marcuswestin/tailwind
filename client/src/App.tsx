import React, { useState } from 'react'
import { Offer, Order } from '@duffel/api'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { SearchCard } from './examples/SearchCard'
import { BookingCard } from './examples/BookingCard'
import { ConfirmationCard } from './examples/ConfirmationCard'
import { Resource } from './types'

import './index.css'

const ErrorDisplay: React.FC<{ error: Error }> = ({ error }) => (
  <div className="error">{error.message}</div>
)

function App() {
  const [offer, setOffer] = useState<Resource<Offer>>(null)
  const [order, setOrder] = useState<Resource<Order>>(null)

  const hasOffer =
    offer && typeof offer === 'object' && !(offer instanceof Error)
  const hasOrder =
    order && typeof order === 'object' && !(order instanceof Error)

  return (
    <div className="page">
      <Header />
      <Hero />

      <div className="example-flow">
        <div className="container">
          {!offer && (
            <SearchCard
              beforeSearch={() => setOrder(null)}
              onSuccess={offer => setOffer(offer)}
              onError={e => setOffer(e)}
            />
          )}
          {hasOffer && !hasOrder && (
            <BookingCard
              offer={offer}
              onSuccess={order => setOrder(order)}
              onError={e => {
                setOrder(e)
                setOffer(null)
              }}
            />
          )}
          {hasOffer && hasOrder && <ConfirmationCard order={order} />}
          {offer instanceof Error && <ErrorDisplay error={offer} />}
          {order instanceof Error && <ErrorDisplay error={order} />}
          {offer && (
            <button
              className="example-flow__reset"
              onClick={() => {
                setOrder(null)
                setOffer(null)
              }}>
              Start new search
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
