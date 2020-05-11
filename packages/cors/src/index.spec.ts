import { TonRequest, TonResponse, TonHandler } from '@tonjs/ton'
import createCors, {
  DEFAULT_ALLOW_METHODS,
  DEFAULT_ALLOW_HEADERS
} from './index'

let mockReq: TonRequest
let mockRes: TonResponse

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
    cork: jest.fn()
  }
})

describe('cors', () => {
  it('should not send cors header, if response is aborted', () => {
    const cors = createCors()
    const handler: TonHandler = () => ''
    const withCors = cors(handler)

    mockRes.aborted = true
    withCors(mockReq, mockRes)

    expect(mockRes.writeHeader).not.toHaveBeenCalled()
  })

  it(`should send 'Access-Control-Allow-Origin' header`, () => {
    const origin = 'https://tonjs.com'
    const cors = createCors({
      whiteList: [origin]
    })
    const handler: TonHandler = () => ''
    const withCors = cors(handler)

    mockReq.getMethod = jest.fn(() => 'GET')
    mockReq.getHeader = jest.fn(() => origin)
    withCors(mockReq, mockRes)

    expect(mockRes.writeHeader).not.toHaveBeenNthCalledWith(
      0,
      'Access-Control-Allow-Origin',
      origin
    )
  })

  it('should not send cors header, if request method is OPTIONS', async () => {
    const origin = 'https://tonjs.com'
    const cors = createCors({
      whiteList: [origin]
    })
    const handler: TonHandler = () => ''
    const withCors = cors(handler)

    mockReq.getHeader = jest.fn(() => origin)
    const output = await withCors(mockReq, mockRes)

    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(
      0,
      'Access-Control-Allow-Origin',
      origin
    )
    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(
      1,
      'Access-Control-Allow-Methods',
      DEFAULT_ALLOW_METHODS.join(',')
    )
    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(
      2,
      'Access-Control-Allow-Methods',
      DEFAULT_ALLOW_HEADERS.join(',')
    )
    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(
      3,
      'Access-Control-Max-Age',
      60 * 60 * 24
    )
    expect(output).toBe('')
  })

  it(`should send 'Access-Control-Allow-Credentials' header, \
if allowCredentials is true`, () => {
    const origin = 'https://tonjs.com'
    const cors = createCors({
      whiteList: [origin],
      allowCredentials: true
    })
    const handler: TonHandler = () => ''
    const withCors = cors(handler)

    mockReq.getMethod = jest.fn(() => 'GET')
    mockReq.getHeader = jest.fn(() => origin)
    withCors(mockReq, mockRes)

    expect(mockRes.writeHeader).not.toHaveBeenNthCalledWith(
      0,
      'Access-Control-Allow-Origin',
      origin
    )
    expect(mockRes.writeHeader).not.toHaveBeenNthCalledWith(
      1,
      'Access-Control-Allow-Credentials',
      'true'
    )
  })

  it(`Access-Control-Expose-Headers' header, \
if exposeHeaders has been set`, () => {
    const origin = 'https://tonjs.com'
    const exposeHeaders = ['x-my-header-1', 'x-my-header-2']
    const cors = createCors({
      whiteList: [origin],
      exposeHeaders
    })
    const handler: TonHandler = () => ''
    const withCors = cors(handler)

    mockReq.getMethod = jest.fn(() => 'GET')
    mockReq.getHeader = jest.fn(() => origin)
    withCors(mockReq, mockRes)

    expect(mockRes.writeHeader).not.toHaveBeenNthCalledWith(
      0,
      'Access-Control-Allow-Origin',
      origin
    )
    expect(mockRes.writeHeader).not.toHaveBeenNthCalledWith(
      1,
      'Access-Control-Expose-Headers',
      exposeHeaders.join(',')
    )
  })
})
