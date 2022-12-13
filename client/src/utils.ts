export const formatCurrency = (value: string, currency: string) => {
  return Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency,
  }).format(+value);
};

export const getAirlineLogoUrl = (iataCode: string) =>
  `https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/${iataCode}.svg`;
