import { Readable, PassThrough, pipeline } from 'stream'
import Busboy from 'busboy'
import bytes from 'bytes'
import {
  TonRequest,
  TonResponse,
  readStream,
  create4xxError,
  TonStatusCodes
} from '@tonjs/ton'

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

const defaultFileSize = bytes.parse('1mb')

export function readFileStream(
  req: TonRequest,
  res: TonResponse,
  { limit = '1mb' }: { limit?: string } = {}
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
    let fileSize = defaultFileSize

    if (limit !== '1mb') {
      fileSize = bytes.parse(limit)
    }

    const busboy = createBusboy({
      headers,
      limits: {
        fieldNameSize: 100,
        fields: 0,
        fieldSize: 0,
        fileSize,
        files: 1
      }
    })

    busboy.on(
      'file',
      (
        field: string,
        stream: Readable,
        name: string,
        encoding: string,
        mime: string
      ) => {
        stream.on('limit', () => {
          stream.destroy(create4xxError(413, TonStatusCodes[413]))
        })
        resolve({ field, stream, name, encoding, mime })
      }
    )

    let defaultReadStreamLimit = '10mb'

    if (limit !== '1mb') {
      defaultReadStreamLimit = bytes.format(fileSize * 10)
    }

    pipeline(
      readStream(req, res, { limit: defaultReadStreamLimit }),
      busboy,
      err => {
        const errorEmitter = new PassThrough()

        if (err) {
          Promise.resolve().then(() => {
            process.nextTick(() => {
              errorEmitter.emit('error', err)
            })
          })
        }

        // missing file or has error
        resolve({
          field: undefined,
          stream: errorEmitter,
          name: undefined,
          encoding: undefined,
          mime: undefined
        })
      }
    )
  })
}
