import { Readable, PassThrough, pipeline } from 'stream'
import Busboy from 'busboy'
import { TonRequest, TonResponse, readStream } from '@tonjs/ton'

export function createBusboy(options: busboy.BusboyConfig = {}) {
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

export function readFileStream(
  req: TonRequest,
  res: TonResponse,
  options?: { limit?: string }
): Promise<{
  field?: string
  stream?: Readable
  name?: string
  encoding?: string
  mime?: string
}> {
  return new Promise(resolve => {
    const headers = {
      'content-type': req.getHeader('content-type')
    }
    const busboy = createBusboy({ headers, limits: { files: 1 } })

    busboy.on(
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

    pipeline(readStream(req, res, options), busboy, err => {
      const errorEmitter = new PassThrough()

      if (err) {
        Promise.resolve().then(() => {
          process.nextTick(() => {
            errorEmitter.emit('error', err)
          })
        })
      }

      resolve({
        field: undefined,
        stream: errorEmitter,
        name: undefined,
        encoding: undefined,
        mime: undefined
      })
    })
  })
}
