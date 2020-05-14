import { Readable, PassThrough } from 'stream'
import Busboy from 'busboy'
import { TonRequest, TonResponse, readStream } from '@tonjs/ton/src/index'

export function createBusboy(options: busboy.BusboyConfig) {
  try {
    return new Busboy(options)
  } catch (error) {
    const errorEmitter = new PassThrough()
    process.nextTick(() => {
      errorEmitter.emit('error', error)
    })
    return errorEmitter
  }
}

export function readFile(
  req: TonRequest,
  res: TonResponse,
  options: { limit?: string }
): Promise<{
  field: string
  stream: Readable
  name: string
  encoding: string
  mime: string
}> {
  return new Promise((resolve, reject) => {
    const headers = {}
    req.forEach((key, value) => {
      headers[key] = value
    })

    const busboy = new Busboy({ headers, limits: { files: 1 } })
    readStream(req, res, options)
      .on('error', reject)
      .pipe(busboy)
      .on(
        'file',
        (
          field: string,
          stream: Readable,
          name: string,
          encoding: string,
          mime: string
        ) => {
          resolve({ field, stream, name, encoding, mime })
        }
      )
  })
}
