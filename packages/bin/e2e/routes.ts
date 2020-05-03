import { TonRoutes, sendEmpty, sendText } from '@tonjs/ton'

const routes: TonRoutes = [
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
export default routes
