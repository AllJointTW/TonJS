import {
  TonHandler,
  TonResponse,
  TonRequest,
  TonData,
  TonRoute,
  TonRoutes
} from '@tonjs/ton'

export const defaultAllowMethods: string[] = [
  'POST',
  'GET',
  'PUT',
  'PATCH',
  'DELETE',
  'OPTIONS'
]

export const defaultAllowHeaders: string[] = [
  'X-Requested-With',
  'Access-Control-Allow-Origin',
  'X-HTTP-Method-Override',
  'Content-Type',
  'Authorization',
  'Accept'
]

export const defaultMaxAgeSeconds: number = 60 * 60 * 24 // 24 hours

export declare type CorsOptions = {
  origins?: string[]
  maxAge?: number
  allowMethods?: string[]
  allowMethodsString?: string
  allowHeaders?: string[]
  allowHeadersString?: string
  allowCredentials?: boolean
  exposeHeaders?: string[]
  exposeHeadersString?: string
}

export function addCorsWith(handler: TonHandler, options: CorsOptions) {
  return function addCors(req: TonRequest, res: TonResponse): TonData | void {
    const origin = req.getHeader('origin')
    if (options.origins.includes('*')) {
      res.writeHeader('Access-Control-Allow-Origin', '*')
    } else if (options.origins.includes(origin)) {
      res.writeHeader('Access-Control-Allow-Origin', origin)
    }

    if (options.allowCredentials) {
      res.writeHeader('Access-Control-Allow-Credentials', 'true')
    }

    if (options.exposeHeaders.length) {
      res.writeHeader(
        'Access-Control-Expose-Headers',
        options.exposeHeadersString
      )
    }

    // is preflight
    if (req.getMethod() === 'OPTIONS') {
      res.writeHeader(
        'Access-Control-Allow-Methods',
        options.allowMethodsString
      )
      res.writeHeader(
        'Access-Control-Allow-Headers',
        options.allowHeadersString
      )
      res.writeHeader('Access-Control-Max-Age', String(options.maxAge))
    }

    return handler(req, res)
  }
}

export default function cors(options: CorsOptions = {}) {
  return (
    endpoints: TonHandler | TonRoute | TonRoutes
  ): TonHandler | TonRoute | TonRoutes => {
    const inputOptions: CorsOptions = {
      origins:
        options.origins ||
        (process.env.CORS_WHITE_LIST || '')
          .split(',')
          .map(item => item.trim())
          .filter(item => !!item),
      maxAge: options.maxAge || defaultMaxAgeSeconds,
      allowMethods: options.allowMethods || defaultAllowMethods,
      allowHeaders: options.allowHeaders || defaultAllowHeaders,
      allowCredentials:
        typeof options.allowCredentials !== 'boolean'
          ? true
          : options.allowCredentials,
      exposeHeaders: options.exposeHeaders || []
    }

    inputOptions.allowMethodsString = inputOptions.allowMethods.join(',')
    inputOptions.allowHeadersString = inputOptions.allowHeaders.join(',')
    inputOptions.exposeHeadersString = inputOptions.exposeHeaders.join(',')

    // TonRoutes
    if (Array.isArray(endpoints)) {
      return endpoints.map(route => {
        const handler = addCorsWith(route.handler, inputOptions)
        Object.defineProperty(handler, 'name', {
          value: handler.name,
          writable: false,
          configurable: false
        })
        return { ...route, handler }
      })
    }

    // TonRoute
    if (typeof endpoints === 'object' && endpoints !== null) {
      const handler = addCorsWith(endpoints.handler, inputOptions)
      Object.defineProperty(handler, 'name', {
        value: handler.name,
        writable: false,
        configurable: false
      })
      return { ...endpoints, handler }
    }

    // TonHandler
    if (typeof endpoints === 'function') {
      return addCorsWith(endpoints, inputOptions)
    }

    return undefined
  }
}
