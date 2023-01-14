// This needs to be imported before anything else to load environment variables from .env file before
// any other global initialization that may require the environment variables loaded
import './env-setup'
import app from './server'

// Start the server
const port = Number(process.env.PORT || 4001)
app.listen(port, () => {
  console.info('Express server started on port: ' + port)
})
