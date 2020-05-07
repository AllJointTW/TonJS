#!/usr/bin/env node
import path from 'path'
import {
  TonHandler,
  TonRoute,
  TonRoutes,
  TonListenSocket,
  createApp,
  listen,
  routes,
  registerGracefulShutdown,
  TonApp
} from '@tonjs/ton'
import * as logger from '@tonjs/logger'

import yargs = require('yargs')

export const parser = yargs
  .scriptName('ton')
  .usage('Usage: $0 <entry> <options>')
  .help()
  .version()
  .alias('version', 'v')
  .epilogue('for more information, find our docs at https://tonjs.com')
  .example('$0 index.js', 'listen on 0.0.0.0:3000 and index.js as the entry.')
  .locale('en')
  .options({
    host: {
      type: 'string',
      alias: 'h',
      desc: 'Specify the host name',
      default: '0.0.0.0'
    },
    port: {
      type: 'number',
      alias: 'p',
      desc: 'Specify the port number',
      default: 3000
    },
    ssl: {
      type: 'boolean',
      desc: 'Need SSL?',
      implies: ['key', 'cert']
    },
    key: {
      type: 'string',
      desc: 'Specify the path of key of SSL'
    },
    cert: {
      type: 'string',
      desc: 'Specify the path of cert of SSL'
    },
    passphrase: {
      type: 'string',
      desc: 'Specify the passphrase of SSL cert'
    },
    dhParams: {
      type: 'string',
      desc: 'Specify the path of params.dh of SSL'
    },
    preferLowMemoryUsage: {
      type: 'boolean',
      desc:
        'Translate SSL to buffer, not only low memory, but also low performance'
    }
  })

export default async function main(
  argv: any
): Promise<{ app: TonApp; token: TonListenSocket }> {
  try {
    logger.info('[Try Love TonJS]')
    const [entry = 'index.js'] = argv._
    const endpoint: TonHandler | TonRoute | TonRoutes = (
      await import(path.resolve(process.cwd(), entry))
    ).default
    const app = createApp(argv)
    routes(app, endpoint, { logger })
    const token: TonListenSocket = await listen(app, argv.host, argv.port)
    registerGracefulShutdown(token)
    logger.info(
      `you raise me up, to listen on http://${argv.host}:${argv.port}`
    )
    return { app, token }
  } catch (err) {
    logger.info(`failed to listen on ${argv.host}:${argv.port}`)
    logger.error(err)
    process.exit(1)
    return err
  }
}

/* istanbul ignore next */
if (process.env.NODE_ENV !== 'test') {
  main(parser.argv)
}
