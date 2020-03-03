import path from 'path'
import {
  createApp,
  listen,
  route,
  TonHandler,
  TonListenSocket,
  registerGracefulShutdown,
  TonRoutes
} from './index'

import yargs = require('yargs')

const { argv } = yargs
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

async function main() {
  try {
    const [entry = 'index.js'] = argv._
    const app = createApp(argv)
    const endpoints: TonHandler | TonRoutes = (
      await import(path.resolve(process.cwd(), entry))
    ).default

    console.info('\nroutes:') // eslint-disable-line
    if (typeof endpoints === 'object' && endpoints !== null) {
      Object.keys(endpoints as TonRoutes).forEach(key => {
        const pattern = key
        const { methods, handler } = endpoints[key]
        let handlerName = handler.name || 'anonymous'
        if (handlerName === 'handler') {
          handlerName = 'anonymous'
        }
        console.info(`  ${key} => ${handlerName}()`) // eslint-disable-line
        route(app, methods, pattern, handler)
      })
    } else {
      const { name = 'anonymous' } = endpoints as TonHandler
      console.info(`  * => ${name}()`) // eslint-disable-line
      route(app, 'ANY', '*', endpoints as TonHandler)
    }

    const token = await listen(app, argv.host, argv.port)
    registerGracefulShutdown(token)
    // eslint-disable-next-line
    console.info(
      `\nyou raise me up, to listen on http://${argv.host}:${argv.port}\n`
    )
  } catch (err) {
    console.info(`\nfailed to listen on ${argv.host}:${argv.port}\n`) // eslint-disable-line
    console.error(err) // eslint-disable-line
  }
}

main()
