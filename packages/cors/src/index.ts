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

    const preFlight = req.getMethod() === 'OPTIONS'
    if (preFlight) {
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

export default function cors(inputOption: CorsOptions = {}) {
  return (
    endpoints: TonHandler | TonRoute | TonRoutes
  ): TonHandler | TonRoute | TonRoutes => {
    const options: CorsOptions = {
      origins:
        inputOption.origins ||
        (process.env.CORS_WHITE_LIST || '')
          .split(',')
          .map(el => el.trim())
          .filter(el => !!el),
      maxAge: inputOption.maxAge || defaultMaxAgeSeconds,
      allowMethods: inputOption.allowMethods || defaultAllowMethods,
      allowHeaders: inputOption.allowHeaders || defaultAllowHeaders,
      allowCredentials:
        typeof inputOption.allowCredentials !== 'boolean'
          ? true
          : inputOption.allowCredentials,
      exposeHeaders: inputOption.exposeHeaders || []
    }
    options.allowMethodsString = options.allowMethods.join(',')
    options.allowHeadersString = options.allowHeaders.join(',')
    options.exposeHeadersString = options.exposeHeaders.join(',')
    if (Array.isArray(endpoints)) {
      return endpoints.map(route => {
        const handler = addCorsWith(route.handler, options)
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
      const handler = addCorsWith(endpoints.handler, options)
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
      return addCorsWith(endpoints, options)
    }
    return undefined
  }
}
