/* eslint-disable no-console */
import {
  send,
  redirect,
  createApp,
  listen,
  registerGracefulShutdown,
  route
} from '../packages/ton/src'

const host = '0.0.0.0'
const port = 3000

async function main() {
  const app = createApp()
  route(app, 'get', '/', (req, res) => send(res, 200, 'TonJS'))
  route(app, 'get', '/redirect', (req, res) =>
    redirect(res, 302, 'https://tonjs.com')
  )
  const token = await listen(app, host, port)
  registerGracefulShutdown(token)
  console.info(`\nyou raise me up, to listen on http://${host}:${port}\n`)
}

main()
