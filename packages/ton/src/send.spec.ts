import { Readable } from 'stream'
import * as ton from './index'

let mockLogger: ton.TonLogger
let mockRes: ton.TonResponse

beforeEach(() => {
  mockLogger = {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn()
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
    cork: jest.fn()
  }
})

describe('checkIsNotAborted', () => {
  it('should not throw error', () => {
    expect(() => ton.checkIsNotAborted(mockRes)).not.toThrow()
  })

  it('should throw error', () => {
    mockRes.aborted = true
    expect(() => ton.checkIsNotAborted(mockRes)).toThrow(
      ton.create5xxError(500, "Can't send anything after response was aborted")
    )
  })
})

describe('writeStatus', () => {
  it('should write status 204', () => {
    const statusCode = 204

    ton.writeStatus(mockRes, statusCode)

    expect(mockRes.writeStatus).toHaveBeenCalledTimes(1)
    expect(mockRes.writeStatus).toHaveBeenCalledWith(
      `${statusCode} ${ton.TonStatusCodes[statusCode]}`
    )
  })

  it('should write status 500, if statusCode is empty', () => {
    ton.writeStatus(mockRes, 0)

    expect(mockRes.writeStatus).toHaveBeenCalledTimes(1)
    expect(mockRes.writeStatus).toHaveBeenCalledWith(
      `${500} ${ton.TonStatusCodes[500]}`
    )
  })

  it(`should write status 500, \
if can't find statusCode in TonStatusCodes`, () => {
    ton.writeStatus(mockRes, 600)

    expect(mockRes.writeStatus).toHaveBeenCalledTimes(1)
    expect(mockRes.writeStatus).toHaveBeenCalledWith(
      `${500} ${ton.TonStatusCodes[500]}`
    )
  })
})

describe('writeHeaders', () => {
  it(`should write headers { 'power-by': 'ton', 'hello': 'hi' }`, () => {
    const headers = { by: 'ton', hello: 'hi' }

    ton.writeHeaders(mockRes, headers)

    expect(mockRes.writeHeader).toHaveBeenCalledTimes(2)
    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(1, 'by', 'ton')
    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(2, 'hello', 'hi')
  })
})

describe('sendEmpty', () => {
  it('should not send anything after response was aborted', () => {
    mockRes.aborted = true
    expect(() => ton.sendEmpty(mockRes)).toThrow(
      ton.create5xxError(500, "Can't send anything after response was aborted")
    )

    expect(mockRes.writeHeader).toHaveBeenCalledTimes(0)
    expect(mockRes.writeStatus).toHaveBeenCalledTimes(0)
    expect(mockRes.end).toHaveBeenCalledTimes(0)
  })

  it('should send empty', () => {
    const headers = { by: 'ton', hello: 'hi' }

    ton.sendEmpty(mockRes, headers)

    expect(mockRes.writeStatus).toHaveBeenCalledTimes(1)
    expect(mockRes.writeStatus).toHaveBeenCalledWith(
      `204 ${ton.TonStatusCodes[204]}`
    )

    expect(mockRes.writeHeader).toHaveBeenCalledTimes(2)
    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(1, 'by', 'ton')
    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(2, 'hello', 'hi')

    expect(mockRes.end).toHaveBeenCalledTimes(1)
  })
})

describe('sendText', () => {
  it('should not send anything after response was aborted', () => {
    mockRes.aborted = true
    expect(() => ton.sendText(mockRes, 200, '')).toThrow(
      ton.create5xxError(500, "Can't send anything after response was aborted")
    )

    expect(mockRes.writeHeader).toHaveBeenCalledTimes(0)
    expect(mockRes.writeStatus).toHaveBeenCalledTimes(0)
    expect(mockRes.end).toHaveBeenCalledTimes(0)
  })

  it('should send text', () => {
    const headers = {}

    ton.sendText(mockRes, 201, 'ton', headers)

    expect(mockRes.writeStatus).toHaveBeenCalledTimes(1)
    expect(mockRes.writeStatus).toHaveBeenCalledWith(
      `201 ${ton.TonStatusCodes[201]}`
    )

    expect(mockRes.writeHeader).toHaveBeenCalledTimes(1)
    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(
      1,
      'Content-Type',
      'text/plain; charset=utf-8'
    )

    expect(mockRes.end).toHaveBeenCalledTimes(1)
    expect(mockRes.end).toHaveBeenCalledWith('ton')
  })

  it('should bypass send status 200', () => {
    const headers = {}

    ton.sendText(mockRes, 200, 'ton', headers)

    expect(mockRes.writeStatus).toHaveBeenCalledTimes(0)

    expect(mockRes.writeHeader).toHaveBeenCalledTimes(1)
    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(
      1,
      'Content-Type',
      'text/plain; charset=utf-8'
    )

    expect(mockRes.end).toHaveBeenCalledTimes(1)
    expect(mockRes.end).toHaveBeenCalledWith('ton')
  })
})

describe('sendJSON', () => {
  it('should not send anything after response was aborted', () => {
    mockRes.aborted = true
    expect(() => ton.sendJSON(mockRes, 200, { key: 'value' })).toThrow(
      ton.create5xxError(500, "Can't send anything after response was aborted")
    )

    expect(mockRes.writeHeader).toHaveBeenCalledTimes(0)
    expect(mockRes.writeStatus).toHaveBeenCalledTimes(0)
    expect(mockRes.end).toHaveBeenCalledTimes(0)
  })

  it('should send json', () => {
    const headers = {}

    ton.sendJSON(mockRes, 201, { key: 'value' }, headers)

    expect(mockRes.writeStatus).toHaveBeenCalledTimes(1)
    expect(mockRes.writeStatus).toHaveBeenCalledWith(
      `201 ${ton.TonStatusCodes[201]}`
    )

    expect(mockRes.writeHeader).toHaveBeenCalledTimes(1)
    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(
      1,
      'Content-Type',
      'application/json; charset=utf-8'
    )

    expect(mockRes.end).toHaveBeenCalledTimes(1)
    expect(mockRes.end).toHaveBeenCalledWith('{"key":"value"}')
  })

  it('should bypass send status 200', () => {
    const headers = {}

    ton.sendJSON(mockRes, 200, { key: 'value' }, headers)

    expect(mockRes.writeStatus).toHaveBeenCalledTimes(0)

    expect(mockRes.writeHeader).toHaveBeenCalledTimes(1)
    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(
      1,
      'Content-Type',
      'application/json; charset=utf-8'
    )

    expect(mockRes.end).toHaveBeenCalledTimes(1)
    expect(mockRes.end).toHaveBeenCalledWith('{"key":"value"}')
  })
})

describe('unwrapError', () => {
  const message = "Uncaught TypeError: Cannot read property 'c' of undefined"
  const errorNormal = new Error(message)
  const error400 = ton.create4xxError(400, ton.TonStatusCodes[400])
  const error500 = ton.create5xxError(500, ton.TonStatusCodes[500], errorNormal)

  it('should unwrap the error, if it has original', () => {
    expect(ton.unwrapError(error500)).toBe(errorNormal)
  })

  it("should get the same error, if it doesn't has original", () => {
    expect(ton.unwrapError(error400)).toBe(error400)
  })
})

describe('sendError', () => {
  const originalNodeEnv = process.env.NODE_ENV
  const message = "Uncaught TypeError: Cannot read property 'c' of undefined"
  const errorNormal = new Error(message)
  const error400 = ton.create4xxError(400, ton.TonStatusCodes[400])
  const error500 = ton.create5xxError(500, ton.TonStatusCodes[500], errorNormal)

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv
  })

  it('should not send anything and log the original error, if response is aborted', () => {
    mockRes.aborted = true
    ton.sendError(mockRes, errorNormal, undefined, { logger: mockLogger })

    expect(mockLogger.error).toHaveBeenCalledTimes(1)
    expect(mockLogger.error).toHaveBeenCalledWith(
      ton.create5xxError(500, message)
    )
  })

  it('should send normal error with 500 statusCode', () => {
    ton.sendError(mockRes, errorNormal, undefined, { logger: mockLogger })

    expect(mockRes.writeStatus).toHaveBeenCalledTimes(1)
    expect(mockRes.writeStatus).toHaveBeenCalledWith(
      `500 ${ton.TonStatusCodes[500]}`
    )

    expect(mockRes.writeHeader).toHaveBeenCalledTimes(1)
    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(
      1,
      'Content-Type',
      'application/json; charset=utf-8'
    )

    expect(mockRes.end).toHaveBeenCalledTimes(1)
    expect(mockRes.end).toHaveBeenCalledWith(`{"message":"${message}"}`)

    expect(mockLogger.error).toHaveBeenCalledTimes(1)
    expect(mockLogger.error).toHaveBeenCalledWith(errorNormal)
  })

  it('should send 500 error and logger.error message of normal error', () => {
    ton.sendError(mockRes, error500, undefined, { logger: mockLogger })

    expect(mockRes.writeStatus).toHaveBeenCalledTimes(1)
    expect(mockRes.writeStatus).toHaveBeenCalledWith(
      `500 ${ton.TonStatusCodes[500]}`
    )

    expect(mockRes.writeHeader).toHaveBeenCalledTimes(1)
    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(
      1,
      'Content-Type',
      'application/json; charset=utf-8'
    )

    expect(mockRes.end).toHaveBeenCalledTimes(1)
    expect(mockRes.end).toHaveBeenCalledWith(
      `{"message":"${ton.TonStatusCodes[500]}"}`
    )

    expect(mockLogger.error).toHaveBeenCalledTimes(1)
    expect(mockLogger.error).toHaveBeenCalledWith(errorNormal)
  })

  it('should send 400 error and should not logger.error it', () => {
    ton.sendError(mockRes, error400, undefined, { logger: mockLogger })

    expect(mockRes.writeStatus).toHaveBeenCalledTimes(1)
    expect(mockRes.writeStatus).toHaveBeenCalledWith(
      `400 ${ton.TonStatusCodes[400]}`
    )

    expect(mockRes.writeHeader).toHaveBeenCalledTimes(1)
    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(
      1,
      'Content-Type',
      'application/json; charset=utf-8'
    )

    expect(mockRes.end).toHaveBeenCalledTimes(1)
    expect(mockRes.end).toHaveBeenCalledWith(
      `{"message":"${ton.TonStatusCodes[400]}"}`
    )

    expect(mockLogger.error).toHaveBeenCalledTimes(0)
  })

  it(`
should send normal error with 500 statusCode and message of TonStatusCode, \
if process.env.NODE_ENV equal to 'production'`, () => {
    process.env.NODE_ENV = 'production'
    ton.sendError(mockRes, errorNormal, undefined, { logger: mockLogger })

    expect(mockRes.writeStatus).toHaveBeenCalledTimes(1)
    expect(mockRes.writeStatus).toHaveBeenCalledWith(
      `500 ${ton.TonStatusCodes[500]}`
    )

    expect(mockRes.writeHeader).toHaveBeenCalledTimes(1)
    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(
      1,
      'Content-Type',
      'application/json; charset=utf-8'
    )

    expect(mockRes.end).toHaveBeenCalledTimes(1)
    expect(mockRes.end).toHaveBeenCalledWith(
      `{"message":"${ton.TonStatusCodes[500]}"}`
    )

    expect(mockLogger.error).toHaveBeenCalledTimes(1)
    expect(mockLogger.error).toHaveBeenCalledWith(errorNormal)
  })

  it(`should send message of TonStatusCode[statusCode], \
if message is empty`, () => {
    const errorEmpty = new Error() as ton.TonError
    errorEmpty.statusCode = 502
    ton.sendError(mockRes, errorEmpty, undefined, { logger: mockLogger })

    expect(mockRes.writeStatus).toHaveBeenCalledTimes(1)
    expect(mockRes.writeStatus).toHaveBeenCalledWith(
      `502 ${ton.TonStatusCodes[502]}`
    )

    expect(mockRes.writeHeader).toHaveBeenCalledTimes(1)
    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(
      1,
      'Content-Type',
      'application/json; charset=utf-8'
    )

    expect(mockRes.end).toHaveBeenCalledTimes(1)
    expect(mockRes.end).toHaveBeenCalledWith(
      `{"message":"${ton.TonStatusCodes[502]}"}`
    )

    expect(mockLogger.error).toHaveBeenCalledTimes(1)
    expect(mockLogger.error).toHaveBeenCalledWith(errorEmpty)
  })

  it(`should send message of TonStatusCodes[500], if message is empty`, () => {
    const errorEmpty = new Error() as ton.TonError
    errorEmpty.statusCode = 600
    ton.sendError(mockRes, errorEmpty, undefined, { logger: mockLogger })

    expect(mockRes.writeStatus).toHaveBeenCalledTimes(1)
    expect(mockRes.writeStatus).toHaveBeenCalledWith(
      `500 ${ton.TonStatusCodes[500]}`
    )

    expect(mockRes.writeHeader).toHaveBeenCalledTimes(1)
    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(
      1,
      'Content-Type',
      'application/json; charset=utf-8'
    )

    expect(mockRes.end).toHaveBeenCalledTimes(1)
    expect(mockRes.end).toHaveBeenCalledWith(
      `{"message":"${ton.TonStatusCodes[500]}"}`
    )

    expect(mockLogger.error).toHaveBeenCalledTimes(1)
    expect(mockLogger.error).toHaveBeenCalledWith(errorEmpty)
  })
})

describe('sendStream', () => {
  let mockStream: ton.TonStream = new Readable()
  const buffer = Buffer.from('asdf')

  beforeEach(() => {
    mockStream = new Readable()
    // eslint-disable-next-line @typescript-eslint/no-empty-function, no-underscore-dangle
    mockStream._read = function read() {}
    mockStream.destroy = jest.fn()
    mockStream.resume = jest.fn()
    mockStream.pause = jest.fn()
    mockStream.size = buffer.length
  })

  it('should bypass send status 200', () => {
    ton.sendStream(mockRes, 200, mockStream)

    expect(mockRes.writeStatus).toHaveBeenCalledTimes(0)
    expect(mockRes.writeHeader).toHaveBeenCalledTimes(1)
    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(
      1,
      'Content-Type',
      'application/octet-stream'
    )
  })

  it('should destroy stream, if response is on aborted', () => {
    mockRes.onAborted = jest.fn(fn => {
      fn()
      return mockRes
    })
    ton.sendStream(mockRes, 201, mockStream)
    expect(mockStream.destroy).toHaveBeenCalledTimes(1)
    expect(mockRes.aborted).toBe(true)
  })

  it('should destroy stream, if stream is on error', () => {
    ton.sendStream(mockRes, 201, mockStream)
    mockStream.emit('error', ton.create4xxError(400, 'mock error'))
    expect(mockStream.destroy).toHaveBeenCalledTimes(1)
    expect(mockRes.aborted).toBe(true)
  })

  it('should end response, if stream is end', () => {
    mockRes.tryEnd = jest.fn(() => [false, true])
    ton.sendStream(mockRes, 201, mockStream)

    mockStream.emit('end')
    expect(mockRes.end).toHaveBeenCalledTimes(1)
    expect(mockRes.aborted).toBe(true)
  })

  it(`should not repeat end the response, \
if stream is end but response is on aborted`, () => {
    mockRes.tryEnd = jest.fn(() => [false, true])
    ton.sendStream(mockRes, 201, mockStream)

    mockRes.aborted = true
    mockStream.emit('end')
    expect(mockRes.end).toHaveBeenCalledTimes(0)
  })

  it(`should not send the stream (without size),
if response is on aborted`, () => {
    mockRes.tryEnd = jest.fn()
    delete mockStream.size
    ton.sendStream(mockRes, 201, mockStream)

    mockRes.aborted = true
    mockStream.emit('data', buffer)
    expect(mockRes.tryEnd).toHaveBeenCalledTimes(0)
  })

  it(`should send the stream (without size) by res.write,
if stream without size`, () => {
    mockRes.write = jest.fn((arrayBuffer: ArrayBuffer) => {
      expect(Buffer.from(arrayBuffer).toString()).toBe(buffer.toString())
      return mockRes
    })
    delete mockStream.size
    ton.sendStream(mockRes, 201, mockStream)

    mockStream.emit('data', buffer)
    expect(mockRes.tryEnd).toHaveBeenCalledTimes(0)
  })

  it('should not send the stream, if response is on aborted', () => {
    mockRes.tryEnd = jest.fn()
    ton.sendStream(mockRes, 201, mockStream)

    mockRes.aborted = true
    mockStream.emit('data', buffer)
    expect(mockRes.tryEnd).toHaveBeenCalledTimes(0)
  })

  it('should destroy the stream, if done in first try', () => {
    mockRes.tryEnd = jest.fn((arrayBuffer: ArrayBuffer, size) => {
      expect(Buffer.from(arrayBuffer).toString()).toBe(buffer.toString())
      expect(size).toBe(buffer.length)
      return [false, true]
    })
    ton.sendStream(mockRes, 201, mockStream)

    mockStream.emit('data', buffer)
    expect(mockStream.destroy).toHaveBeenCalledTimes(1)
  })

  it('should not pause or destroy stream, if ok in first try', () => {
    mockRes.tryEnd = jest.fn((arrayBuffer: ArrayBuffer, size) => {
      expect(Buffer.from(arrayBuffer).toString()).toBe(buffer.toString())
      expect(size).toBe(buffer.length)
      return [true, false]
    })
    ton.sendStream(mockRes, 201, mockStream)

    mockStream.emit('data', buffer)
    expect(mockStream.pause).toHaveBeenCalledTimes(0)
    expect(mockStream.destroy).toHaveBeenCalledTimes(0)
  })

  it('should pause stream, if is not ok or done in first try', () => {
    mockRes.tryEnd = jest.fn((arrayBuffer: ArrayBuffer, size) => {
      expect(Buffer.from(arrayBuffer).toString()).toBe(buffer.toString())
      expect(size).toBe(buffer.length)
      return [false, false]
    })
    ton.sendStream(mockRes, 201, mockStream)

    mockStream.emit('data', buffer)
    expect(mockStream.pause).toHaveBeenCalledTimes(1)
  })

  it('should destroy stream, if is done in onWritable try', () => {
    const length = 2
    mockRes.tryEnd = jest.fn((arrayBuffer: ArrayBuffer, size) => {
      expect(Buffer.from(arrayBuffer).toString()).toBe(buffer.toString())
      expect(size).toBe(buffer.length)
      return [false, false]
    })
    mockRes.getWriteOffset = jest.fn(() => length)
    mockRes.onWritable = jest.fn(fn => {
      mockRes.tryEnd = jest.fn((arrayBuffer: ArrayBuffer, size) => {
        expect(Buffer.from(arrayBuffer).toString()).toBe(
          buffer.toString().slice(length)
        )
        expect(size).toBe(buffer.length)
        return [false, true]
      })
      expect(fn(0)).toBe(false) // ok
      return mockRes
    })
    ton.sendStream(mockRes, 201, mockStream)

    mockStream.emit('data', buffer)
    expect(mockStream.pause).toHaveBeenCalledTimes(1)
    expect(mockRes.aborted).toBe(true)
    expect(mockStream.destroy).toHaveBeenCalledTimes(1)
  })

  it('should resume stream, if is not done but ok in onWritable try', () => {
    const length = 2
    mockRes.tryEnd = jest.fn((arrayBuffer: ArrayBuffer, size) => {
      expect(Buffer.from(arrayBuffer).toString()).toBe(buffer.toString())
      expect(size).toBe(buffer.length)
      return [false, false]
    })
    mockRes.getWriteOffset = jest.fn(() => length)
    mockRes.onWritable = jest.fn(fn => {
      mockRes.tryEnd = jest.fn((arrayBuffer: ArrayBuffer, size) => {
        expect(Buffer.from(arrayBuffer).toString()).toBe(
          buffer.toString().slice(length)
        )
        expect(size).toBe(buffer.length)
        return [true, false]
      })
      expect(fn(0)).toBe(true) // ok
      return mockRes
    })
    ton.sendStream(mockRes, 201, mockStream)

    mockStream.emit('data', buffer)
    expect(mockStream.resume).toHaveBeenCalledTimes(2)
  })

  it(`should resume or destroy stream, \
if is not done and ok in onWritable try`, () => {
    const length = 2
    mockRes.tryEnd = jest.fn((arrayBuffer: ArrayBuffer, size) => {
      expect(Buffer.from(arrayBuffer).toString()).toBe(buffer.toString())
      expect(size).toBe(buffer.length)
      return [false, false]
    })
    mockRes.getWriteOffset = jest.fn(() => length)
    mockRes.onWritable = jest.fn(fn => {
      mockRes.tryEnd = jest.fn((arrayBuffer: ArrayBuffer, size) => {
        expect(Buffer.from(arrayBuffer).toString()).toBe(
          buffer.toString().slice(length)
        )
        expect(size).toBe(buffer.length)
        return [false, false]
      })
      expect(fn(0)).toBe(false) // ok
      return mockRes
    })
    ton.sendStream(mockRes, 201, mockStream)

    mockStream.emit('data', buffer)
    expect(mockStream.destroy).toHaveBeenCalledTimes(0)
    expect(mockStream.resume).toHaveBeenCalledTimes(1)
  })
})

describe('redirect', () => {
  it('should not send anything after response was aborted', () => {
    mockRes.aborted = true
    expect(() => ton.redirect(mockRes, 301, 'https://tonjs.com')).toThrow(
      ton.create5xxError(500, "Can't send anything after response was aborted")
    )

    expect(mockRes.writeHeader).toHaveBeenCalledTimes(0)
    expect(mockRes.writeStatus).toHaveBeenCalledTimes(0)
    expect(mockRes.end).toHaveBeenCalledTimes(0)
  })

  it('should send json', () => {
    ton.redirect(mockRes, 301, 'https://tonjs.com')

    expect(mockRes.writeStatus).toHaveBeenCalledTimes(1)
    expect(mockRes.writeStatus).toHaveBeenCalledWith(
      `301 ${ton.TonStatusCodes[301]}`
    )

    expect(mockRes.writeHeader).toHaveBeenCalledTimes(1)
    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(
      1,
      'Location',
      'https://tonjs.com'
    )

    expect(mockRes.end).toHaveBeenCalledTimes(1)
  })
})

describe('send', () => {
  it('should send empty, if statusCode is 204', () => {
    ton.send(mockRes, 204, undefined)

    expect(mockRes.writeStatus).toHaveBeenCalledTimes(1)
    expect(mockRes.writeStatus).toHaveBeenCalledWith(
      `204 ${ton.TonStatusCodes[204]}`
    )

    expect(mockRes.writeHeader).toHaveBeenCalledTimes(0)
    expect(mockRes.end).toHaveBeenCalledTimes(1)
  })

  it('should send empty, if data is undefined', () => {
    ton.send(mockRes, 200, undefined)

    expect(mockRes.writeStatus).toHaveBeenCalledTimes(1)
    expect(mockRes.writeStatus).toHaveBeenCalledWith(
      `204 ${ton.TonStatusCodes[204]}`
    )

    expect(mockRes.writeHeader).toHaveBeenCalledTimes(0)
    expect(mockRes.end).toHaveBeenCalledTimes(1)
  })

  it('should send empty, if data is null', () => {
    ton.send(mockRes, 200, null)

    expect(mockRes.writeStatus).toHaveBeenCalledTimes(1)
    expect(mockRes.writeStatus).toHaveBeenCalledWith(
      `204 ${ton.TonStatusCodes[204]}`
    )

    expect(mockRes.writeHeader).toHaveBeenCalledTimes(0)
    expect(mockRes.end).toHaveBeenCalledTimes(1)
  })

  it('should send text, if data is string', () => {
    ton.send(mockRes, 200, 'ton')

    expect(mockRes.writeHeader).toHaveBeenCalledTimes(1)
    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(
      1,
      'Content-Type',
      'text/plain; charset=utf-8'
    )

    expect(mockRes.end).toHaveBeenCalledTimes(1)
    expect(mockRes.end).toHaveBeenCalledWith('ton')
  })

  it('should send stream, if data is readable stream', () => {
    const mockStream: ton.TonStream = new Readable()
    const buffer = Buffer.from('asdf')
    // eslint-disable-next-line no-underscore-dangle, @typescript-eslint/no-empty-function
    mockStream._read = function read() {}
    mockStream.destroy = jest.fn()
    mockStream.resume = jest.fn()
    mockStream.pause = jest.fn()
    mockStream.size = buffer.length
    mockRes.tryEnd = jest.fn((arrayBuffer: ArrayBuffer, size) => {
      expect(Buffer.from(arrayBuffer).toString()).toBe(buffer.toString())
      expect(size).toBe(buffer.length)
      return [false, true]
    })
    ton.send(mockRes, 201, mockStream)

    mockStream.emit('data', buffer)
    expect(mockStream.destroy).toHaveBeenCalledTimes(1)
  })

  it('should send error, if data is error', () => {
    const message = 'Invalid Fields'
    const error = new Error(message)

    ton.send(mockRes, 200, error, undefined, { logger: mockLogger })

    expect(mockRes.writeStatus).toHaveBeenCalledTimes(1)
    expect(mockRes.writeStatus).toHaveBeenCalledWith(
      `500 ${ton.TonStatusCodes[500]}`
    )

    expect(mockRes.writeHeader).toHaveBeenCalledTimes(1)
    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(
      1,
      'Content-Type',
      'application/json; charset=utf-8'
    )

    expect(mockRes.end).toHaveBeenCalledTimes(1)
    expect(mockRes.end).toHaveBeenCalledWith(`{"message":"${message}"}`)

    expect(mockLogger.error).toHaveBeenCalledTimes(1)
    expect(mockLogger.error).toHaveBeenCalledWith(error)
  })

  it('should send JSON, if data is object', () => {
    ton.send(mockRes, 200, { key: 'value' })

    expect(mockRes.writeHeader).toHaveBeenCalledTimes(1)
    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(
      1,
      'Content-Type',
      'application/json; charset=utf-8'
    )

    expect(mockRes.end).toHaveBeenCalledTimes(1)
    expect(mockRes.end).toHaveBeenCalledWith('{"key":"value"}')
  })
})
