const { sendText, sendEmpty } = require('@tonjs/ton')

/**
 * @type {import('@tonjs/ton').TonRoutes}
 */
const routes = [
  {
    methods: 'get',
    pattern: '/',
    handler: (req, res) => sendText(res, 200, 'TonJS')
  },
  {
    methods: 'get',
    pattern: '/empty',
    handler: (req, res) => sendEmpty(res)
  },
  {
    methods: 'any',
    pattern: '/ping',
    handler: function pong() {
      return {
        result: 'pong'
      }
    }
  }
]
module.exports = routes
