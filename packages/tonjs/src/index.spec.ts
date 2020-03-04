import { STATUS_CODES } from 'http'
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
    cork: jest.fn(fn => fn())
  }
})

describe('writeStatus', () => {
  it('should write status 204', () => {
    const statusCode = 204

    ton.writeStatus(mockRes, statusCode)

    expect(mockRes.writeStatus).toHaveBeenCalledTimes(1)
    expect(mockRes.writeStatus).toHaveBeenCalledWith(
      `${statusCode} ${STATUS_CODES[statusCode]}`
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
  it('should not send anything when response is aborted', () => {
    mockRes.aborted = true
    ton.sendEmpty(mockRes)

    expect(mockRes.writeHeader).toHaveBeenCalledTimes(0)
    expect(mockRes.writeStatus).toHaveBeenCalledTimes(0)
    expect(mockRes.end).toHaveBeenCalledTimes(0)
  })

  it('should send empty', () => {
    const headers = { by: 'ton', hello: 'hi' }

    ton.sendEmpty(mockRes, headers)

    expect(mockRes.writeStatus).toHaveBeenCalledTimes(1)
    expect(mockRes.writeStatus).toHaveBeenCalledWith(`204 ${STATUS_CODES[204]}`)

    expect(mockRes.writeHeader).toHaveBeenCalledTimes(2)
    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(1, 'by', 'ton')
    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(2, 'hello', 'hi')

    expect(mockRes.end).toHaveBeenCalledTimes(1)
  })
})

describe('sendText', () => {
  it('should not send anything when response is aborted', () => {
    mockRes.aborted = true
    ton.sendText(mockRes, 200, '')

    expect(mockRes.writeHeader).toHaveBeenCalledTimes(0)
    expect(mockRes.writeStatus).toHaveBeenCalledTimes(0)
    expect(mockRes.end).toHaveBeenCalledTimes(0)
  })

  it('should send text', () => {
    const headers = {}

    ton.sendText(mockRes, 201, 'ton', headers)

    expect(mockRes.writeStatus).toHaveBeenCalledTimes(1)
    expect(mockRes.writeStatus).toHaveBeenCalledWith(`201 ${STATUS_CODES[201]}`)

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
