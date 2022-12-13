import { Order } from '@duffel/api';
import React from 'react';
import { Card } from '../components/Card';
import { formatCurrency, getAirlineLogoUrl } from '../utils';

interface ConfirmationCardProps {
  order: Order;
}

export const ConfirmationCard: React.FC<ConfirmationCardProps> = ({
  order,
}) => (
  <>
    <h4>Example booking flow</h4>
    <h2>3/3 Your order was created.</h2>

    <Card.Root>
      <Card.Content>
        <img
          src={getAirlineLogoUrl(order.owner.iata_code)}
          alt={order.owner.name}
          width={24}
          height={24}
        />
        <Card.Text color="dark">{order.owner.name}</Card.Text>
        <Card.Text className="offer-currency" color="dark">
          {formatCurrency(order.total_amount, order.total_currency)}
        </Card.Text>
      </Card.Content>
      <Card.Button disabled={true} secondary>
        Booked!
      </Card.Button>
    </Card.Root>

    <p>
      Booking reference: <strong>{order.booking_reference}</strong>
    </p>
  </>
);
