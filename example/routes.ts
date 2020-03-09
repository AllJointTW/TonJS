import { TonRoutes, send, redirect } from '../packages/tonjs/src'

const routes: TonRoutes = {
  '/': { methods: 'get', handler: (req, res) => send(res, 200, 'TonJS') },
  '/redirect': {
    methods: 'get',
    handler: (req, res) => redirect(res, 302, 'https://tonjs.com')
  }
}
export default routes
