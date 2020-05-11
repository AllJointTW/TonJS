import {
  TonHandler,
  TonResponse,
  TonRequest,
  TonData,
  TonRoute,
  TonRoutes,
  route
} from '@tonjs/ton'

export const DEFAULT_ALLOW_METHODS: Array<string> = [
  'POST',
  'GET',
  'PUT',
  'PATCH',
  'DELETE',
  'OPTIONS'
]
export const DEFAULT_ALLOW_HEADERS: Array<string> = [
  'X-Requested-With',
  'Access-Control-Allow-Origin',
  'X-HTTP-Method-Override',
  'Content-Type',
  'Authorization',
  'Accept'
]
const DEFAULT_MAX_AGE_SECONDS: number = 60 * 60 * 24 // 24 hours
export declare type CorsOptions = {
  origin: string
  maxAge: number
  allowMethods: Array<string>
  allowHeaders: Array<string>
  allowCredentials: boolean
  exposeHeaders: Array<string>
}

export function addCors(handler: TonHandler, option) {
  return function a(req: TonRequest, res: TonResponse): TonData {
    const origin = '*' || option.origin
    const maxAge = DEFAULT_MAX_AGE_SECONDS || option.maxAge
    const allowMethods = DEFAULT_ALLOW_METHODS || option.allowMethods
    const allowHeaders = DEFAULT_ALLOW_HEADERS || option.allowHeaders
    const allowCredentials = true || option.allowCredentials
    const exposeHeaders = [] || option.exposeHeaders
    if (res && res.aborted) {
      return handler(req, res)
    }
    res.writeHeader('Access-Control-Allow-Origin', origin)
    if (allowCredentials) {
      res.writeHeader('Access-Control-Allow-Credentials', 'true')
    }
    if (exposeHeaders.length) {
      res.writeHeader('Access-Control-Expose-Headers', exposeHeaders.join(','))
    }
    const preFlight = req.getMethod() === 'OPTIONS'
    if (preFlight) {
      res.writeHeader('Access-Control-Allow-Methods', allowMethods.join(','))
      res.writeHeader('Access-Control-Allow-Headers', allowHeaders.join(','))
      res.writeHeader('Access-Control-Max-Age', String(maxAge))
    }
    return handler(req, res)
  }
}

export default function cors(option?: CorsOptions) {
  return (
    endpoints: TonHandler | TonRoute | TonRoutes
  ): TonHandler | TonRoute | TonRoutes => {
    if (Array.isArray(endpoints)) {
      endpoints.forEach(route => {
        // eslint-disable-next-line no-param-reassign
        route.handler = addCors(route.handler, option)
        Object.defineProperty(route.handler, 'name', {
          value: route.handler.name,
          writable: false,
          configurable: false
        })
      })
      return endpoints
    }

    if (typeof endpoints === 'object' && endpoints !== null) {
      endpoints.handler = addCors(endpoints.handler, option)
      Object.defineProperty(route.handler, 'name', {
        value: route.handler.name,
        writable: false,
        configurable: false
      })
      return endpoints
    }

    if (typeof endpoints === 'function') {
      return addCors(endpoints, option)
    }
  }
}
