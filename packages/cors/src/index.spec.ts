import {
  TonRequest,
  TonResponse,
  TonHandler,
  TonRoute,
  TonRoutes
} from '@tonjs/ton'
import createCors, {
  defaultAllowMethods,
  defaultAllowHeaders,
  defaultMaxAgeSeconds
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
    const withCors = cors(handler) as TonHandler

    mockRes.aborted = true
    withCors(mockReq, mockRes)

    expect(mockRes.writeHeader).toHaveBeenCalledWith(
      'Access-Control-Allow-Credentials',
      'true'
    )
  })

  it(`should send 'Access-Control-Allow-Origin' header`, () => {
    const origin = 'https://tonjs.com'
    const cors = createCors({
      origins: [origin]
    })
    const handler: TonHandler = () => ''
    const withCors = cors(handler) as TonHandler

    mockReq.getMethod = jest.fn(() => 'GET')
    mockReq.getHeader = jest.fn(() => origin)
    withCors(mockReq, mockRes)

    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(
      1,
      'Access-Control-Allow-Origin',
      origin
    )
    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(
      2,
      'Access-Control-Allow-Credentials',
      'true'
    )
  })

  it('should not send cors header, if request method is not OPTIONS', async () => {
    const origin = 'https://tonjs.com'
    const cors = createCors({
      origins: [origin]
    })
    const handler: TonHandler = () => ''
    const withCors = cors(handler) as TonHandler

    mockReq.getHeader = jest.fn(() => origin)
    const output = await withCors(mockReq, mockRes)

    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(
      1,
      'Access-Control-Allow-Origin',
      origin
    )
    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(
      2,
      'Access-Control-Allow-Credentials',
      'true'
    )
    expect(mockRes.writeHeader).toHaveBeenCalledTimes(2)
    expect(output).toBe('')
  })

  it(`should send 'Access-Control-Allow-Credentials' header, \
if allowCredentials is true`, () => {
    const origin = 'https://tonjs.com'
    const cors = createCors({
      origins: [origin],
      allowCredentials: true
    })
    const handler: TonHandler = () => ''
    const withCors = cors(handler) as TonHandler

    mockReq.getMethod = jest.fn(() => 'GET')
    mockReq.getHeader = jest.fn(() => origin)
    withCors(mockReq, mockRes)

    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(
      1,
      'Access-Control-Allow-Origin',
      origin
    )
    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(
      2,
      'Access-Control-Allow-Credentials',
      'true'
    )
  })

  it(`should not send 'Access-Control-Allow-Credentials' header, \
if allowCredentials is false`, () => {
    const origin = 'https://tonjs.com'
    const cors = createCors({
      origins: [origin],
      allowCredentials: false
    })
    const handler: TonHandler = () => ''
    const withCors = cors(handler) as TonHandler

    mockReq.getMethod = jest.fn(() => 'GET')
    mockReq.getHeader = jest.fn(() => origin)
    withCors(mockReq, mockRes)

    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(
      1,
      'Access-Control-Allow-Origin',
      origin
    )
    expect(mockRes.writeHeader).not.toHaveBeenNthCalledWith(
      2,
      'Access-Control-Allow-Credentials',
      'true'
    )
  })
  it(`should send 'Access-Control-Expose-Headers' header, \
if exposeHeaders has been set`, () => {
    const origin = 'https://tonjs.com'
    const exposeHeaders = ['x-my-header-1', 'x-my-header-2']
    const cors = createCors({
      origins: [origin],
      exposeHeaders
    })
    const handler: TonHandler = () => ''
    const withCors = cors(handler) as TonHandler

    mockReq.getMethod = jest.fn(() => 'GET')
    mockReq.getHeader = jest.fn(() => origin)
    withCors(mockReq, mockRes)

    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(
      1,
      'Access-Control-Allow-Origin',
      origin
    )
    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(
      2,
      'Access-Control-Allow-Credentials',
      'true'
    )
    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(
      3,
      'Access-Control-Expose-Headers',
      exposeHeaders.join(',')
    )
  })

  it(`should send 'Access-Control-Allow-Origin' header as '*', \
if origins includes '*'`, () => {
    const origin = '*,https://tonjs.com'
    const cors = createCors({
      origins: origin.split(',')
    })
    const handler: TonHandler = () => ''
    const withCors = cors(handler) as TonHandler

    mockReq.getMethod = jest.fn(() => 'GET')
    mockReq.getHeader = jest.fn(() => origin)
    withCors(mockReq, mockRes)

    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(
      1,
      'Access-Control-Allow-Origin',
      '*'
    )
  })

  it(`should send 'Access-Control-Allow-Methods, Access-Control-Allow-Headers, Access-Control-Max-Age' header, \
if request method is OPTIONS`, () => {
    const origin = 'https://tonjs.com'
    const cors = createCors({
      origins: [origin]
    })
    const handler: TonHandler = () => ''
    const withCors = cors(handler) as TonHandler

    mockReq.getMethod = jest.fn(() => 'OPTIONS')
    mockReq.getHeader = jest.fn(() => origin)
    withCors(mockReq, mockRes)

    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(
      1,
      'Access-Control-Allow-Origin',
      'https://tonjs.com'
    )

    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(
      2,
      'Access-Control-Allow-Credentials',
      'true'
    )
    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(
      3,
      'Access-Control-Allow-Methods',
      defaultAllowMethods.join(',')
    )
    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(
      4,
      'Access-Control-Allow-Headers',
      defaultAllowHeaders.join(',')
    )
    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(
      5,
      'Access-Control-Max-Age',
      String(defaultMaxAgeSeconds)
    )
  })

  it(`should do nothing, if handler is null`, () => {
    const cors = createCors()
    const withCors = cors(null)
    expect(withCors).toBeUndefined()
  })

  it(`should replace handler , if give addCors a route`, () => {
    const route: TonRoute = {
      methods: 'get',
      pattern: '/',
      handler: () => 'Hi There!'
    }
    const routeName = route.handler.name
    const cors = createCors()
    const withCors = cors(route) as TonRoute
    expect(withCors.handler.name).not.toEqual(routeName)
  })

  it(`should replace all handler , if give addCors routes`, () => {
    const routes: TonRoutes = [
      {
        methods: 'get',
        pattern: '/',
        handler: () => ''
      },
      {
        methods: 'get',
        pattern: '/redirect',
        handler: () => ''
      },
      {
        methods: 'any',
        pattern: 'ping',
        handler: function pong() {
          return 'pong'
        }
      }
    ]
    const nameBucket = []
    routes.forEach(route => {
      nameBucket.push(route.handler.name)
    })
    const cors = createCors()
    const withCors = cors(routes) as TonRoutes
    for (let i = 0; i < nameBucket.length; i += 1) {
      expect(nameBucket[i]).not.toEqual(withCors[i].handler.name)
    }
  })
})
