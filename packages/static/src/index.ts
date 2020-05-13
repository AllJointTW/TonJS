import { resolve } from 'path'
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

export const createStaticStream = function createStaticStream(path: string) {
  const stream: TonStream = createReadStream(path)
  stream.size = statSync(path).size
  return stream
}

export const staticHandler = function staticHandler(
  root: string,
  index: string
) {
  return async function addStaticstatic(req: TonRequest, res: TonResponse) {
    if (req.getMethod() === 'HEAD' || req.getMethod() === 'GET') {
      let path = req.getUrl()
      if (index && path[path.length - 1] === '/') {
        path += index
      }
      path = resolve(root, index)
      if (!existsSync(path)) {
        sendError(res, create4xxError(404, TonStatusCodes[404]))
        return
      }
      sendStream(res, 200, createStaticStream(path))
    }
  }
}

export function createStatic(options: StaticOption) {
  return (): TonHandler => {
    const { root = '', index = 'index.html' } = options
    return staticHandler(root, index)
  }
}

export default server
