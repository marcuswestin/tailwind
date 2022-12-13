import React, { useState } from 'react'
import { Card } from '../components/Card'
import { Offer } from '@duffel/api'
import { GENERIC_ERROR_MESSAGE } from './constants'

interface SearchCardProps {
  beforeSearch(): void
  onSuccess(offer: Offer): void
  onError(e: Error): void
}

export const SearchCard: React.FC<SearchCardProps> = ({
  beforeSearch,
  onSuccess,
  onError,
}) => {
  const [sort, setSort] = useState<'total_amount' | 'total_duration'>(
    'total_duration',
  )
  const [origin, setOrigin] = useState('JFK')
  const [destination, setDestination] = useState('LHR')
  const [isFetching, setIsFetching] = useState(false)

  const fetchOffers = async () => {
    beforeSearch()
    setIsFetching(true)

    try {
      const res = await fetch('/api/search', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin,
          destination,
          sort,
        }),
      })

      const { offer, errors } = await res.json()

      if (errors) {
        onError(
          new Error(
            Array.isArray(errors) ? errors[0].title : GENERIC_ERROR_MESSAGE,
          ),
        )
        return
      }

      if (!offer) {
        onError(new Error(GENERIC_ERROR_MESSAGE))
        return
      }

      onSuccess(offer)
    } catch (e) {
      onError(e instanceof Error ? e : new Error(GENERIC_ERROR_MESSAGE))
    }

    setIsFetching(false)
  }

  return (
    <>
      <h4>Example booking flow</h4>
      <h2>1/3 Let’s make a simple search.</h2>

      <Card.Root>
        <Card.Content>
          <Card.Highlight secondary>Next available</Card.Highlight>
          <Card.Select
            onSelect={option => setSort(option as any)}
            defaultValue={sort}
            options={[
              { value: 'total_amount', label: 'cheapest flight' },
              { value: 'total_duration', label: 'shortest flight' },
            ]}
          />
          <Card.Text color="light">from</Card.Text>
          <Card.Select
            onSelect={setOrigin}
            defaultValue={origin}
            options={[
              { value: 'JFK', label: 'JFK' },
              { value: 'MIA', label: 'MIA' },
              { value: 'LAX', label: 'LAX' },
              { value: 'SFO', label: 'SFO' },
            ]}
          />
          <Card.Text color="light">to</Card.Text>
          <Card.Select
            onSelect={setDestination}
            defaultValue={destination}
            options={[
              { value: 'LHR', label: 'LHR' },
              { value: 'CDG', label: 'CDG' },
              { value: 'FRA', label: 'FRA' },
              { value: 'MAD', label: 'MAD' },
            ]}
          />
        </Card.Content>

        <Card.Button onClick={fetchOffers} disabled={isFetching}>
          {isFetching ? 'Searching…' : 'Search'}
        </Card.Button>
      </Card.Root>
    </>
  )
}
