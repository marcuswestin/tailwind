import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import helmet from 'helmet'
import xss from 'xss-clean'
import express, { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import BaseRouter from './routes'
import { readFileSync } from 'fs'
import path from 'path'

const app = express()

app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(xss())
app.use(cookieParser())

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

if (process.env.NODE_ENV === 'production') {
  app.use(helmet())
}

app.use('/api', BaseRouter)

app.use('/__vite_ping', (_: Request, res: Response) => {
  return res.status(200).send('ok')
})

const airportsData = readFileSync(path.join(__dirname, 'data/airports.json'))
app.use('/data/airports.json', async (_: Request, res: Response) => {
  setTimeout(() => {
    res.status(200).send(airportsData)
  }, 100)
})

// Print API errors
app.use((err: Error, _: Request, res: Response, _next: NextFunction) => {
  console.error(err, true)
  return res.status(StatusCodes.BAD_REQUEST).json({
    error: err.message,
  })
})

// Export express instance
export default app
