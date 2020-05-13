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

declare type StaticOption = {
  root?: string
  index?: string
}

export function createStaticStream(path: string) {
  const stream: TonStream = createReadStream(path)
  stream.size = statSync(path).size
  return stream
}

export function staticHandler(root: string, index: string) {
  return async function addStaticstatic(req: TonRequest, res: TonResponse) {
    if (req.getMethod() === 'head' || req.getMethod() === 'get') {
      let path = req.getUrl()
      if (index && path[path.length - 1] === '/') {
        path += index
      }
      path = join(root, path)
      if (!existsSync(path)) {
        sendError(res, create4xxError(404, TonStatusCodes[404]))
        return
      }
      const result = createStaticStream(path)
      sendStream(res, 200, result)
      return
    }
    sendError(res, create4xxError(404, TonStatusCodes[404]))
  }
}

export function createStatic(options: StaticOption) {
  return (): TonHandler => {
    const { root = process.cwd(), index = 'index.html' } = options
    return staticHandler(root, index)
  }
}
