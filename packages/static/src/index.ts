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
import etag from 'etag'

export type CacheOption = {
  enableCacheControl?: boolean
  enableLastModified?: boolean
  enableEtag?: boolean
  maxage?: number
  immutable?: boolean
}

export type StaticOption = CacheOption & {
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

const isConditionalGET = function isConditionalGET(req: TonRequest) {
  return (
    req.getHeader('if-match') ||
    req.getHeader('if-unmodified-since') ||
    req.getHeader('if-none-match') ||
    req.getHeader('if-modified-since')
  )
}

// const isPreconditionFailure = function isPreconditionFailure(req: TonRequest) {
//   // if-match
//   const match = req.getHeader('if-match')
//   if (match) {
//     return (
//       !etag ||
//       (match !== '*' &&
//         parseTokenList(match).every(function(match) {
//           return (
//             match !== etag && match !== `W/${etag}` && `W/${match}` !== etag
//           )
//         }))
//     )
//   }

//   // if-unmodified-since
//   const unmodifiedSince = parseHttpDate(req.headers['if-unmodified-since'])
//   if (!isNaN(unmodifiedSince)) {
//     const lastModified = parseHttpDate(res.getHeader('Last-Modified'))
//     return isNaN(lastModified) || lastModified > unmodifiedSince
//   }

//   return false
// }

const setCacheHeaders = function setCacheHeaders(
  res: TonResponse,
  options: CacheOption
) {
  // TODO file stat should be in public
  const stat = statSync('mockPath')
  // if enable cache
  if (options.enableCacheControl) {
    let cacheControl = `public, max-age=${Math.floor(options.maxage / 1000)}`
    if (options.immutable) {
      cacheControl += ', immutable'
    }
    res.writeHeader('Cache-Control', cacheControl)
  }
  // set Last-Modified
  if (options.enableLastModified) {
    res.writeHeader('Last-Modified', stat.mtime.toUTCString())
  }

  // set ETag
  if (options.enableEtag) {
    res.writeHeader('ETag', etag(stat))
  }
}
