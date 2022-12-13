import path from 'path'
import dotenv from 'dotenv'
import args from 'command-line-args'

// load environment variables based on the command line input (default to development)
// This needs to be imported first thing,
const options = args([
  {
    name: 'env',
    alias: 'e',
    defaultValue: 'development',
    type: String,
  },
])

// load environment file into env variables
const { error } = dotenv.config({
  path: path.join(__dirname, `../env/${options.env}.env`),
})

if (error) {
  throw error
}
