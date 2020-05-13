import {
  TonHandler,
  TonResponse,
  TonRequest,
  TonData,
  TonRoute,
  TonRoutes,
  getHandlerName
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

export declare type CORSOptions = {
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

export function addCORSWith(
  handler: TonHandler,
  options: CORSOptions
): TonHandler {
  return function addCORS(req: TonRequest, res: TonResponse): TonData | void {
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

function isTonRoutes(target: any): target is TonRoutes {
  return Array.isArray(target)
}

function isTonRoute(target: any): target is TonRoute {
  return typeof target === 'object' && target !== null
}

function isTonHandler(target: any): target is TonHandler {
  return typeof target === 'function'
}

export function createCORS(options: CORSOptions = {}) {
  return <T extends TonHandler | TonRoute | TonRoutes>(endpoints: T): T => {
    const inputOptions: CORSOptions = {
      origins:
        options.origins ||
        (process.env.CORS_ORIGINS || '')
          .split(',')
          .map(item => item.trim())
          .filter(item => !!item),
      maxAge: options.maxAge || defaultMaxAgeSeconds,
      allowMethods: options.allowMethods || defaultAllowMethods,
      allowHeaders: options.allowHeaders || defaultAllowHeaders,
      allowCredentials: options.allowCredentials === true,
      exposeHeaders: options.exposeHeaders || []
    }

    inputOptions.allowMethodsString = inputOptions.allowMethods.join(',')
    inputOptions.allowHeadersString = inputOptions.allowHeaders.join(',')
    inputOptions.exposeHeadersString = inputOptions.exposeHeaders.join(',')

    // TonRoutes
    if (isTonRoutes(endpoints)) {
      return endpoints.map(route => {
        const handler = addCORSWith(route.handler, inputOptions)
        Object.defineProperty(handler, 'name', {
          value: getHandlerName(route.handler),
          writable: false,
          configurable: false
        })
        return { ...route, handler }
      }) as T
    }

    // TonRoute
    if (isTonRoute(endpoints)) {
      const handler = addCORSWith(endpoints.handler, inputOptions)
      Object.defineProperty(handler, 'name', {
        value: getHandlerName(endpoints.handler),
        writable: false,
        configurable: false
      })
      return { ...endpoints, handler } as T
    }

    // TonHandler
    if (isTonHandler(endpoints)) {
      const handler = addCORSWith(endpoints, inputOptions)
      Object.defineProperty(handler, 'name', {
        value: getHandlerName(endpoints),
        writable: false,
        configurable: false
      })
      return handler as T
    }

    return undefined
  }
}
