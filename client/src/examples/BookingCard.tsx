import { useState } from 'react'
import { Offer, Order } from '@duffel/api'
import { Card } from '../components/Card'
import { formatCurrency, getAirlineLogoUrl } from '../utils'
import { GENERIC_ERROR_MESSAGE } from './constants'

interface BookingCardProps {
  offer: Offer
  onSuccess(order: Order): void
  onError(e: Error): void
}

export const BookingCard: React.FC<BookingCardProps> = ({
  offer,
  onSuccess,
  onError,
}) => {
  const [isFetching, setIsFetching] = useState(false)

  const bookOffer = async () => {
    setIsFetching(true)

    const res = await fetch(`/api/book`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        offerId: offer.id,
        passengers: [
          {
            id: offer.passengers[0].id,
            born_on: '1987-07-24',
            family_name: 'Earheart',
            given_name: 'Amelia',
            gender: 'f',
            title: 'ms',
            email: 'amelia@duffel.com',
            phone_number: '+442080160509',
          },
        ],
        currency: offer.total_currency,
        amount: offer.total_amount,
      }),
    })

    const { order, errors } = await res.json()

    setIsFetching(false)

    if (Array.isArray(errors)) {
      onError(new Error(errors[0].title))
      return
    }

    if (!order) {
      onError(new Error(GENERIC_ERROR_MESSAGE))
      return
    }

    onSuccess(order)
  }

  return (
    <>
      <h4>Example booking flow</h4>
      <h2>2/3 We have a result, now let’s book it.</h2>

      <Card.Root>
        <Card.Content>
          <img
            src={getAirlineLogoUrl(offer.owner.iata_code)}
            alt={offer.owner.name}
            width={24}
            height={24}
          />
          <Card.Text color="dark">{offer.owner.name}</Card.Text>
          <Card.Text className="offer-currency" color="dark">
            {formatCurrency(offer.total_amount, offer.total_currency)}
          </Card.Text>
        </Card.Content>
        <Card.Button
          disabled={isFetching}
          onClick={async () => await bookOffer()}>
          {isFetching ? 'Booking…' : 'Book'}
        </Card.Button>
      </Card.Root>
    </>
  )
}
