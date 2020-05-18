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

export function createStaticStream(path: string): TonStream {
  const stream: TonStream = createReadStream(path)
  stream.size = statSync(path).size
  return stream
}

export function createHandler(
  req: TonRequest,
  res: TonResponse,
  options: StaticOption
) {
  const { root, enableDefaultIndex, index } = options
  if (req.getMethod() === 'head' || req.getMethod() === 'get') {
    let path = req.getUrl()
    // handle special char
    try {
      path = decodeURIComponent(path)
    } catch (err) {
      sendError(res, create4xxError(404, TonStatusCodes[404]))
      return
    }
    // set default index file
    if (enableDefaultIndex && index && path[path.length - 1] === '/') {
      path += index
    }
    path = join(root, path)

    // file not found
    if (!existsSync(path)) {
      sendError(res, create4xxError(404, TonStatusCodes[404]))
      return
    }

    // reject directory path
    if (path[path.length - 1] === '/') {
      sendError(res, create4xxError(404, TonStatusCodes[404]))
      return
    }

    sendStream(res, 200, createStaticStream(path), {
      'Content-Type': getType(path) || 'application/octet-stream'
    })
    return
  }
  sendError(res, create4xxError(404, TonStatusCodes[404]))
}

export function createStatic(options: StaticOption): TonHandler {
  const { root = process.cwd(), enableDefaultIndex = true } = options
  const index = enableDefaultIndex ? options.index || 'index.html' : ''
  return (req: TonRequest, res: TonResponse) =>
    createHandler(req, res, {
      index,
      root,
      enableDefaultIndex
    })
}
