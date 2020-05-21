import stream from 'stream'
import { createGzip, createDeflate, createBrotliCompress } from 'zlib'
import bytes from 'bytes'
import {
  TonRequest,
  TonResponse,
  TonStream,
  TonHeaders,
  sendStream
} from '@tonjs/ton'

export type CompressMethods = {
  [key: string]: stream.Transform
}

export function createCompressMethods(
  custom?: CompressMethods
): CompressMethods {
  return {
    gzip: createGzip(),
    deflate: createDeflate(),
    br: createBrotliCompress(),
    ...custom
  }
}

export const defaultThresholdSize = bytes.parse('1kb')

export type SendCompressedStreamOptions = {
  headers?: TonHeaders
  compressMethods?: CompressMethods
  threshold?: string
}

export function sendCompressedStream(
  req: TonRequest,
  res: TonResponse,
  statusCode: number,
  data: TonStream,
  {
    headers = {},
    compressMethods = createCompressMethods(),
    threshold = '1kb'
  }: SendCompressedStreamOptions = {}
) {
  const accept = req.getHeader('accept-encoding')
  let thresholdSize = defaultThresholdSize

  if (threshold !== '1kb') {
    thresholdSize = bytes.parse(threshold)
  }

  if (
    (typeof data.size === 'number' && data.size < thresholdSize) ||
    accept.includes('identity')
  ) {
    sendStream(res, statusCode, data, headers)
    return
  }

  const compressionTypes = Object.keys(compressMethods)

  for (let index = 0; index < compressionTypes.length; index += 1) {
    if (accept.includes(compressionTypes[index])) {
      sendStream(
        res,
        statusCode,
        data.pipe(compressMethods[compressionTypes[index]]),
        {
          ...headers,
          'Content-Encoding': compressionTypes[index]
        }
      )
      return
    }
  }

  sendStream(res, statusCode, data, headers)
}
