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

declare type StaticOption = {
  root?: string
  index?: string
}

export function sendStaticStream(path: string, res: TonResponse) {
  const stream: TonStream = createReadStream(path)
  stream.size = statSync(path).size
  sendStream(res, 200, stream, {
    'Content-Type': getType(path)
  })
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
      sendStaticStream(path, res)
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
