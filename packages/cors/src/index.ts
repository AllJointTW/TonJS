import {
  TonHandler,
  TonResponse,
  TonRequest,
  TonData,
  TonRoute,
  TonRoutes
} from '@tonjs/ton'

export const defaultAllowMethods: Array<string> = [
  'POST',
  'GET',
  'PUT',
  'PATCH',
  'DELETE',
  'OPTIONS'
]

export const defaultAllowHeaders: Array<string> = [
  'X-Requested-With',
  'Access-Control-Allow-Origin',
  'X-HTTP-Method-Override',
  'Content-Type',
  'Authorization',
  'Accept'
]

export const defaultMaxAgeSeconds: number = 60 * 60 * 24 // 24 hours

export declare type CorsOptions = {
  origins?: Array<string>
  maxAge?: number
  allowMethods?: Array<string>
  allowHeaders?: Array<string>
  allowCredentials?: boolean
  exposeHeaders?: Array<string>
}

export function addCorsWith(handler: TonHandler, options: CorsOptions = {}) {
  return function addCors(req: TonRequest, res: TonResponse): TonData | void {
    const {
      origins = (process.env.CORS_WHITE_LIST || '')
        .split(',')
        .map(el => el.trim())
        .filter(el => !!el),
      maxAge = defaultMaxAgeSeconds,
      allowMethods = defaultAllowMethods,
      allowHeaders = defaultAllowHeaders,
      allowCredentials = true,
      exposeHeaders = []
    } = options

    const origin = req.getHeader('origin')
    if (origins.includes('*')) {
      res.writeHeader('Access-Control-Allow-Origin', '*')
    } else if (origins.includes(origin)) {
      res.writeHeader('Access-Control-Allow-Origin', origin)
    }

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
      return endpoints.map(route => {
        const handler = addCorsWith(route.handler, option)
        Object.defineProperty(handler, 'name', {
          value: handler.name,
          writable: false,
          configurable: false
        })
        return {
          ...route,
          handler
        }
      })
    }

    if (typeof endpoints === 'object' && endpoints !== null) {
      const handler = addCorsWith(endpoints.handler, option)
      Object.defineProperty(handler, 'name', {
        value: handler.name,
        writable: false,
        configurable: false
      })
      return {
        ...endpoints,
        handler
      }
    }

    if (typeof endpoints === 'function') {
      return addCorsWith(endpoints, option)
    }
    return undefined
  }
}
