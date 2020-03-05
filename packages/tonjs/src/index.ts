import { STATUS_CODES } from 'http'
import stream from 'stream'
import uWS from 'uWebSockets.js'
import bytes from 'bytes'
import { readable } from 'is-stream'

export type TonApp = uWS.TemplatedApp
export type TonAppOptions = {
  ssl?: boolean
  key?: string
  cert?: string
  passphrase?: string
  dhParams?: string
  preferLowMemoryUsage?: boolean
}
export type TonRequest = uWS.HttpRequest
export type TonResponse = uWS.HttpResponse & { aborted: boolean }
export type TonStream = stream.Readable & { size?: number }
export type TonData = string | number | object | TonStream
export type TonHeaders = { [key: string]: string }
export type TonHandler = (
  req: TonRequest,
  res: TonResponse
) => TonData | void | Promise<TonData | void>
export type TonError = Error & {
  statusCode: number
  status: number
  originalError: Error
}
export type TonMethods =
  | 'GET'
  | 'POST'
  | 'OPTIONS'
  | 'DEL'
  | 'PATCH'
  | 'PUT'
  | 'HEAD'
  | 'CONNECT'
  | 'TRACE'
  | 'ANY'
  | 'WS'
  | 'PUBLISH'
export type TonListenSocket = uWS.us_listen_socket // eslint-disable-line
export type TonRoutes = {
  [patter: string]: { methods: TonMethods; handler: TonHandler }
}

const ContentType = 'Content-Type'

export function createError(
  statusCode: number,
  message: string,
  original?: Error
): TonError {
  const err = new Error(message) as TonError
  err.statusCode = statusCode
  err.originalError = original
  return err
}

export function checkIsNotAborted(res: TonResponse) {
  if (res.aborted) {
    throw createError(500, "Can't send anything after response was aborted")
  }
}

export function writeStatus(res: TonResponse, statusCode: number): void {
  res.writeStatus(`${statusCode} ${STATUS_CODES[statusCode]}`)
}

export function writeHeaders(res: TonResponse, headers: TonHeaders): void {
  Object.keys(headers).forEach(key => res.writeHeader(key, headers[key]))
}

export function sendEmpty(res: TonResponse, headers: TonHeaders = {}): void {
  checkIsNotAborted(res)
  writeStatus(res, 204)
  writeHeaders(res, headers)
  res.aborted = true
  res.end()
}

export function sendStream(
  res: TonResponse,
  statusCode: number,
  data: TonStream,
  headers: TonHeaders = {}
): void {
  checkIsNotAborted(res)

  if (statusCode !== 200) {
    writeStatus(res, statusCode)
  }

  writeHeaders(res, {
    [ContentType]: 'application/octet-stream',
    ...headers
  })

  res.onAborted(() => {
    res.aborted = true
    data.destroy()
  })

  data.on('error', err => {
    writeStatus(res, 500)
    res.aborted = true
    res.end()
    data.destroy()
    throw err
  })

  data.on('end', res.end.bind(res))
  data.on('data', chunk => {
    const arrayBuffer = chunk.buffer.slice(
      chunk.byteOffset,
      chunk.byteOffset + chunk.byteLength
    )
    const lastOffset = res.getWriteOffset()
    // first try
    const [firstTryOk, firstTryDone] = res.tryEnd(arrayBuffer, data.size)

    if (firstTryDone || firstTryOk) {
      res.aborted = true
      data.destroy()
      return
    }

    // pause because backpressure
    data.pause()

    // register async handlers for drainage
    res.onWritable(offset => {
      const [ok, done] = res.tryEnd(
        arrayBuffer.slice(offset - lastOffset),
        data.size
      )

      if (done) {
        res.aborted = true
        data.destroy()
        return ok
      }

      if (ok) {
        data.resume()
      }

      return ok
    })
  })
}

export function sendText(
  res: TonResponse,
  statusCode: number,
  data: string,
  headers: TonHeaders = {}
): void {
  checkIsNotAborted(res)

  if (statusCode !== 200) {
    writeStatus(res, statusCode)
  }

  writeHeaders(res, {
    [ContentType]: 'text/plain; charset=utf-8',
    ...headers
  })

  res.aborted = true
  res.end(data)
}

export function sendJSON(
  res: TonResponse,
  statusCode: number,
  data: object,
  headers: TonHeaders = {}
): void {
  checkIsNotAborted(res)

  if (statusCode !== 200) {
    writeStatus(res, statusCode)
  }

  writeHeaders(res, {
    [ContentType]: 'application/json; charset=utf-8',
    ...headers
  })

  res.aborted = true
  res.end(JSON.stringify(data))
}

export function sendError(res: TonResponse, err: TonError): void {
  const statusCode = err.statusCode || err.status || 500
  const message = err.message || STATUS_CODES[statusCode] || STATUS_CODES[500]
  const data = { message }

  if (process.env.NODE_ENV === 'production' && statusCode >= 500) {
    sendJSON(res, 500, { message: STATUS_CODES[500] })
  } else {
    sendJSON(res, 500, data)
  }

  if (statusCode < 500) {
    return
  }

  if (err.originalError && err.originalError instanceof Error) {
    console.error(err.originalError) // eslint-disable-line
  } else {
    console.error(err) // eslint-disable-line
  }
}

export function redirect(
  res: TonResponse,
  statusCode: 301 | 302,
  location: string
): void {
  checkIsNotAborted(res)
  writeStatus(res, statusCode)
  writeHeaders(res, { Location: location })
  res.aborted = true
  res.end()
}

export function send(
  res: TonResponse,
  statusCode: number,
  data?: TonData | void,
  headers: TonHeaders = {}
): void {
  checkIsNotAborted(res)

  if (statusCode === 204 || typeof data === 'undefined' || data === null) {
    sendEmpty(res, headers)
    return
  }

  if (data instanceof stream.Readable && readable(data)) {
    sendStream(res, statusCode, data as TonStream, headers)
    return
  }

  if (typeof data === 'string') {
    sendText(res, statusCode, data as string, headers)
    return
  }

  sendJSON(res, statusCode, data as object, headers)
}

export function readBuffer(
  res: TonResponse,
  { limit = '1mb' } = {}
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const limitSize = bytes.parse(limit)
    let data = Buffer.allocUnsafe(0)

    res.onData((chunk, isLast) => {
      data = Buffer.concat([data, Buffer.from(chunk)])

      if (data.length > limitSize) {
        const statusCode = 413
        reject(createError(statusCode, STATUS_CODES[statusCode]))
        return
      }

      if (isLast) {
        resolve(data)
      }
    })
  })
}

export async function readText(
  res: TonResponse,
  { limit = '1mb', encoding = 'utf-8' } = {}
): Promise<string> {
  const body = await readBuffer(res, { limit })
  return body.toString(encoding)
}

export async function readJSON(
  res: TonResponse,
  { limit = '1mb', encoding = 'utf-8' } = {}
): Promise<any> {
  const body = await readText(res, { limit, encoding })
  try {
    return JSON.parse(body)
  } catch (err) {
    throw createError(400, 'Invalid JSON', err)
  }
}

export function handler(fn: TonHandler) {
  return async (res: TonResponse, req: TonRequest): Promise<void> => {
    res.aborted = false
    res.onAborted(() => {
      res.aborted = true
    })

    try {
      send(res, 200, await fn(req, res))
    } catch (err) {
      sendError(res, createError(500, STATUS_CODES[500], err))
    }
  }
}

export function route(
  app: TonApp,
  methods: TonMethods,
  pattern: string,
  routeHandler: TonHandler
) {
  app[methods.toLocaleLowerCase()](pattern, handler(routeHandler))
}

export function registerGracefulShutdown(socket: TonListenSocket) {
  let hasBeenShutdown = false

  const wrapper = () => {
    if (!hasBeenShutdown) {
      hasBeenShutdown = true
      // eslint-disable-next-line
      console.info('Gracefully shutting down. Please wait...')
      uWS.us_listen_socket_close(socket)
    }
  }

  process.on('SIGINT', wrapper)
  process.on('SIGTERM', wrapper)
  process.on('exit', wrapper)
}

export function createApp(options: TonAppOptions = {}): TonApp {
  if (options.ssl) {
    return uWS.SSLApp({
      key_file_name: options.key, // eslint-disable-line
      cert_file_name: options.cert, // eslint-disable-line
      passphrase: options.passphrase,
      dh_params_file_name: options.dhParams, // eslint-disable-line
      ssl_prefer_low_memory_usage: options.preferLowMemoryUsage // eslint-disable-line
    })
  }
  return uWS.App()
}

export function listen(
  app: TonApp,
  host: string,
  port: number
): Promise<TonListenSocket> {
  return new Promise((resolve, reject) => {
    app.listen(host, port, (token: TonListenSocket) => {
      if (!token) {
        return reject()
      }
      return resolve(token)
    })
  })
}
