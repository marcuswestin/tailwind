import React from 'react'
import { render, screen } from '@testing-library/react'
import App from './App'

test('renders Duffel API documentation link', () => {
  render(<App />)
  const linkElement = screen.getByText(/View our API documentation/i)
  expect(linkElement).toBeInTheDocument()
})
