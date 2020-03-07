import * as ton from './index'

let mockRes: ton.TonResponse

beforeEach(() => {
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

// Todo: describe sendStream

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

describe('sendError', () => {
  const originalConsoleError = console.error // eslint-disable-line
  const originalNodeEnv = process.env.NODE_ENV
  const message = "Uncaught TypeError: Cannot read property 'c' of undefined"
  const errorNormal = new Error(message)
  const error400 = ton.create4xxError(400, ton.TonStatusCodes[400])
  const error500 = ton.create5xxError(500, ton.TonStatusCodes[500], errorNormal)

  beforeEach(() => {
    console.error = jest.fn() // eslint-disable-line
  })

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv
    console.error = originalConsoleError // eslint-disable-line
  })

  it('should send normal error with 500 statusCode', () => {
    ton.sendError(mockRes, errorNormal)

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

    expect(console.error).toHaveBeenCalledTimes(1) // eslint-disable-line
    expect(console.error).toHaveBeenCalledWith(errorNormal) // eslint-disable-line
  })

  it('should send 500 error and console.error message of normal error', () => {
    ton.sendError(mockRes, error500)

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

    expect(console.error).toHaveBeenCalledTimes(1) // eslint-disable-line
    expect(console.error).toHaveBeenCalledWith(errorNormal) // eslint-disable-line
  })

  it('should send 400 error and should not console.error it', () => {
    ton.sendError(mockRes, error400)

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

    expect(console.error).toHaveBeenCalledTimes(0) // eslint-disable-line
  })

  it(`
should send normal error with 500 statusCode and message of TonStatusCode, \
if process.env.NODE_ENV equal to 'production'`, () => {
    process.env.NODE_ENV = 'production'
    ton.sendError(mockRes, errorNormal)

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

    expect(console.error).toHaveBeenCalledTimes(1) // eslint-disable-line
    expect(console.error).toHaveBeenCalledWith(errorNormal) // eslint-disable-line
  })

  it(`should send message of TonStatusCode[statusCode], \
if message is empty`, () => {
    const errorEmpty = new Error() as ton.TonError
    errorEmpty.statusCode = 502
    ton.sendError(mockRes, errorEmpty)

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

    expect(console.error).toHaveBeenCalledTimes(1) // eslint-disable-line
    expect(console.error).toHaveBeenCalledWith(errorEmpty) // eslint-disable-line
  })

  it(`should send message of TonStatusCodes[500], if message is empty`, () => {
    const errorEmpty = new Error() as ton.TonError
    errorEmpty.statusCode = 600
    ton.sendError(mockRes, errorEmpty)

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

    expect(console.error).toHaveBeenCalledTimes(1) // eslint-disable-line
    expect(console.error).toHaveBeenCalledWith(errorEmpty) // eslint-disable-line
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

  // TODO: test should send stream, if data is stream

  it('should send JSON , if data is string', () => {
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
