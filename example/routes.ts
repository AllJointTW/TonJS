import { TonRoutes, redirect, sendText } from '../packages/ton/src'

const routes: TonRoutes = [
  {
    methods: 'get',
    pattern: '/',
    handler: (req, res) => sendText(res, 200, 'TonJS')
  },
  {
    methods: 'get',
    pattern: '/redirect',
    handler: (req, res) => redirect(res, 302, 'https://tonjs.com')
  },
  {
    methods: 'any',
    pattern: 'ping',
    handler: function pong() {
      return 'pong'
    }
  }
]
export default routes
