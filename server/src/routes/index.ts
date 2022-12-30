import { Router } from 'express'
import duffel from '../duffel'
import { DuffelError } from '@duffel/api'

const router = Router()

router.post('/search', async (req, res) => {
  // get tomorrow date
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const { origin, destination, sort } = req.body
  if (!origin || !destination) {
    res.sendStatus(422)
    return
  }

  try {
    // create an offer request for a flight departing tomorrow
    const offerRequestsResponse = await duffel.offerRequests.create({
      slices: [
        {
          origin,
          destination,
          departure_date: tomorrow.toISOString(),
        },
      ],
      passengers: [{ age: 21 }],
      return_offers: false,
    })

    // retrieve the cheapest offer
    const offersResponse = await duffel.offers.list({
      offer_request_id: offerRequestsResponse.data.id,
      sort,
      limit: 1,
    })

    res.send({
      offers: offersResponse.data,
      offer: offersResponse.data[0],
    })
  } catch (e: unknown) {
    console.error(e)
    if (e instanceof DuffelError) {
      res.status(e.meta.status).send({ errors: e.errors })
      return
    }

    res.status(500).send(e)
  }
})

router.post('/book', async (req, res) => {
  const { passengers, offerId, currency, amount } = req.body
  try {
    const response = await duffel.orders.create({
      selected_offers: [offerId],
      passengers,
      type: 'instant',
      payments: [
        {
          type: 'balance',
          currency: currency,
          amount: amount,
        },
      ],
    })

    res.send({ order: response.data })
  } catch (e) {
    console.error(e)
    if (e instanceof DuffelError) {
      res.status(e.meta.status).send({ errors: e.errors })
      return
    }
    res.status(500).send(e)
  }
})

export default router
