import Busboy from 'busboy'
import * as ton from '@tonjs/ton'
import { Readable, PassThrough } from 'stream'
import { createBusboy, readFileStream } from './index'

let mockReq: ton.TonRequest
let mockRes: ton.TonResponse

const fakeContentLengthWithFile = '191'
const fakeContentTypeWithFile =
  'multipart/form-data; boundary=----WebKitFormBoundaryJn2sq1AsgNTy93o4'
const fakeFormDataBufferWithFile = Buffer.from(
  decodeURI(
    `\
------WebKitFormBoundaryJn2sq1AsgNTy93o4\r\n\
Content-Disposition:%20form-data;%20name=%22file%22;%20filename=%22sample.txt%22\r\n\
Content-Type:%20text/plain\r\n\
\r\n\
sample\n\
\r\n\
------WebKitFormBoundaryJn2sq1AsgNTy93o4--\r\n`
  )
)

const fakeContentLengthWithField = '191'
const fakeContentTypeWithField =
  'multipart/form-data; boundary=----WebKitFormBoundaryk0Q2cdnEQ5ht0vbt'
const fakeFormDataBufferWithField = Buffer.from(
  decodeURI(
    `\
------WebKitFormBoundaryk0Q2cdnEQ5ht0vbt\r\n\
Content-Disposition:%20form-data;%20name=%22name%22\r\n\
\r\n\
\r\n\
ton\n\
\r\n\
------WebKitFormBoundaryk0Q2cdnEQ5ht0vbt--\r\n`
  )
)

beforeEach(() => {
  mockReq = {
    getHeader: jest.fn(),
    getMethod: jest.fn(),
    getParameter: jest.fn(),
    getQuery: jest.fn(),
    getUrl: jest.fn(),
    forEach: jest.fn(),
    setYield: jest.fn()
  }

  mockRes = {
    aborted: false,
    writeStatus: jest.fn(),
    writeHeader: jest.fn(),
    write: jest.fn(),
    end: jest.fn(),
    tryEnd: jest.fn(),
    close: jest.fn(),
    getWriteOffset: jest.fn(),
    onWritable: jest.fn(),
    onAborted: jest.fn(),
    onData: jest.fn(),
    getRemoteAddress: jest.fn(),
    cork: jest.fn(),
    getRemoteAddressAsText: jest.fn(),
    getProxiedRemoteAddress: jest.fn(),
    getProxiedRemoteAddressAsText: jest.fn(),
    upgrade: jest.fn()
  }
})

describe('createBusboy', () => {
  it('should create busboy instance', () => {
    const busboy = createBusboy({
      headers: {
        'content-type': fakeContentTypeWithFile,
        'content-length': fakeContentLengthWithFile
      }
    })
    expect(busboy instanceof Busboy).toBe(true)
  })

  it('should use event.emitter emit the error alternative the throw error', async () => {
    return new Promise(done => {
      const busboy = createBusboy()
      busboy.on('error', err => {
        expect(err.message).toBe('Missing Content-Type')
        done()
      })
    })
  })
})

function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  const ab = new ArrayBuffer(buffer.length)
  const view = new Uint8Array(ab)
  for (let i = 0; i < buffer.length; i += 1) {
    view[i] = buffer[i]
  }
  return ab
}

describe('readFileStream', () => {
  it('should get the file stream', async () => {
    mockReq.getHeader = jest.fn(input => {
      switch (input) {
        case 'content-type':
          return fakeContentTypeWithFile
        case 'content-length':
          return fakeContentLengthWithFile
        default:
          return ''
      }
    })
    mockRes.onData = fn => {
      fn(toArrayBuffer(fakeFormDataBufferWithFile), true)
      return mockRes
    }

    const { field, name, stream, encoding, mime } = await readFileStream(
      mockReq,
      mockRes
    )
    expect(field).toBe('file')
    expect(name).toBe('sample.txt')
    expect(stream instanceof Readable).toBe(true)
    expect(encoding).toBe('7bit')
    expect(mime).toBe('text/plain')
  })

  it('should emit the 413 error, if busboy emit the limit event', async () => {
    mockReq.getHeader = jest.fn(input => {
      switch (input) {
        case 'content-type':
          return fakeContentTypeWithFile
        case 'content-length':
          return fakeContentLengthWithFile
        default:
          return ''
      }
    })
    mockRes.onData = fn => {
      fn(toArrayBuffer(fakeFormDataBufferWithFile), true)
      return mockRes
    }

    const { stream } = await readFileStream(mockReq, mockRes)

    expect(stream instanceof Readable).toBe(true)

    return new Promise(done => {
      stream.on('error', err => {
        expect(err).toEqual(ton.create4xxError(413, ton.TonStatusCodes[413]))
        done()
      })
      stream.emit('limit')
    })
  })

  it('should emit the 413 error, if reach the file size limit', async () => {
    mockReq.getHeader = jest.fn(input => {
      switch (input) {
        case 'content-type':
          return fakeContentTypeWithFile
        case 'content-length':
          return fakeContentLengthWithFile
        default:
          return ''
      }
    })
    mockRes.onData = fn => {
      fn(toArrayBuffer(fakeFormDataBufferWithFile), true)
      return mockRes
    }

    const { stream } = await readFileStream(mockReq, mockRes, { limit: '0b' })

    expect(stream instanceof Readable).toBe(true)

    return new Promise(done => {
      stream.on('error', err => {
        expect(err).toEqual(ton.create4xxError(413, ton.TonStatusCodes[413]))
        done()
      })
    })
  })

  it('should emit error, if busboy emit the error', async () => {
    mockReq.getHeader = jest.fn(input => {
      switch (input) {
        case 'content-type':
          return 'missing-type'
        case 'content-length':
          return fakeContentLengthWithFile
        default:
          return ''
      }
    })
    mockRes.onData = fn => {
      fn(toArrayBuffer(fakeFormDataBufferWithFile), true)
      return mockRes
    }

    const { stream } = await readFileStream(mockReq, mockRes)

    expect(stream instanceof PassThrough).toBe(true)

    return new Promise(done => {
      stream.on('error', err => {
        expect(err.message).toBe('Unsupported content type: missing-type')
        done()
      })
    })
  })

  it(`should not emit error, if busboy doesn't get any file`, async () => {
    mockReq.getHeader = jest.fn(input => {
      switch (input) {
        case 'content-type':
          return fakeContentTypeWithField
        case 'content-length':
          return fakeContentLengthWithField
        default:
          return ''
      }
    })
    mockRes.onData = fn => {
      fn(toArrayBuffer(fakeFormDataBufferWithField), true)
      return mockRes
    }

    const { field, name, stream, encoding, mime } = await readFileStream(
      mockReq,
      mockRes
    )

    expect(field).toBe(undefined)
    expect(name).toBe(undefined)
    expect(stream instanceof PassThrough).toBe(true)
    expect(encoding).toBe(undefined)
    expect(mime).toBe(undefined)
  })
})
