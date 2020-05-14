import { join } from 'path'
import {
  TonRequest,
  TonResponse,
  TonHandler,
  create4xxError,
  TonStatusCodes,
  sendError,
  TonStream,
  sendStream
} from '@tonjs/ton'
import { createReadStream, statSync, existsSync } from 'fs'
import { getType } from 'mime/lite'

export type StaticOption = {
  root?: string
  enableDefaultIndex?: boolean
  index?: string
}

export function sendStaticStream(path: string, res: TonResponse) {
  const stream: TonStream = createReadStream(path)
  stream.size = statSync(path).size
  sendStream(res, 200, stream, {
    'Content-Type': getType(path) || 'application/octet-stream'
  })
}

export function createStaticHandler(options: StaticOption) {
  const { root = process.cwd(), enableDefaultIndex = true } = options
  const index = enableDefaultIndex ? options.index || 'index.html' : ''
  return (req: TonRequest, res: TonResponse): TonHandler => {
    if (req.getMethod() === 'head' || req.getMethod() === 'get') {
      let path = req.getUrl()
      try {
        path = decodeURIComponent(path)
      } catch (err) {
        sendError(res, create4xxError(404, TonStatusCodes[404]))
        return
      }
      if (enableDefaultIndex && index && path[path.length - 1] === '/') {
        path += index
      }
      path = join(root, path)
      if (!existsSync(path)) {
        sendError(res, create4xxError(404, TonStatusCodes[404]))
        return
      }
      if (path[path.length - 1] === '/') {
        sendError(res, create4xxError(404, TonStatusCodes[404]))
        return
      }
      sendStaticStream(path, res)
      return
    }
    sendError(res, create4xxError(404, TonStatusCodes[404]))
  }
}
