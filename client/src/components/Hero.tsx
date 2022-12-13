import React from 'react'

export const Hero: React.FC = () => (
  <div className="hero">
    <div className="container">
      <h1>Welcome to your Duffel app</h1>
      <p>
        You’re ready to start building apps using Duffel's Flights API. Check
        out our simple booking flow below, or visit our API docs to learn more.
      </p>

      <a
        href="https://duffel.com/docs/api/overview/welcome"
        target="_blank"
        rel="noopenner noreferrer"
        className="hero__link">
        View our API documentation
      </a>
    </div>
  </div>
)
