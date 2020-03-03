import { TonRoutes, send, redirect } from '../src/index'

const server: TonRoutes = {
  '/': { methods: 'GET', handler: (req, res) => send(res, 200, 'TonJS') },
  '/redirect': {
    methods: 'GET',
    handler: (req, res) => redirect(res, 302, 'https://tonjs.com')
  }
}
export default server
