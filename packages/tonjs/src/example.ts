import { TonRoutes, send, redirect } from './index'

// export default ((req, res) => send(res, 200, '')) as TonHandler

export default {
  '/': { methods: 'GET', handler: (req, res) => send(res, 200, 'TonJS') },
  '/redirect': {
    methods: 'GET',
    handler: (req, res) => redirect(res, 302, 'https://tonjs.com')
  }
} as TonRoutes
