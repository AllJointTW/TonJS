#!/usr/bin/env node
import { join } from 'path'
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

export type TonBinInstance = { app: TonApp; token: TonListenSocket }

export const parser = yargs
  .scriptName('ton')
  .usage('Usage: $0 <entry> <options>')
  .help()
  .alias('help', 'h')
  .version()
  .alias('version', 'v')
  .epilogue('for more information, find our docs at https://tonjs.com')
  .example(
    '$0 index.js',
    'listen on http://0.0.0.0:3000 and index.js as the entry.'
  )
  .locale('en')
  .options({
    host: {
      type: 'string',
      desc: 'Specify the host name',
      default: '0.0.0.0'
    },
    port: {
      type: 'number',
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

export default async function main(argv: any): Promise<TonBinInstance | Error> {
  try {
    logger.info('[Try Love TonJS]')
    const [entry = 'index.js'] = argv._
    const endpoint: TonHandler | TonRoute | TonRoutes = (
      await import(join(process.cwd(), entry))
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
    logger.error(err.stack)
    process.exit(1)
    return err
  }
}

function bootstrap() {
  /* istanbul ignore next */
  if (
    process.env.NODE_ENV === 'test' ||
    parser.argv.help ||
    parser.argv.version
  ) {
    return
  }
  /* istanbul ignore next */
  main(parser.argv)
}

bootstrap()
