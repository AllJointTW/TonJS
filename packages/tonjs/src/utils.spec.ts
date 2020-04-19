import net from 'net'
import uWS from 'uWebSockets.js'
import * as ton from './index'

function checkPortInUse(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer(socket => {
      socket.write('echo')
      socket.pipe(socket)
    })
    server.listen(port, '0.0.0.0')
    server.on('error', () => resolve(true))
    server.on('listening', () => {
      server.close(() => resolve(false))
    })
  })
}

let mockRes: ton.TonResponse
let mockApp: ton.TonApp

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

  mockApp = {
    listen: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    options: jest.fn(),
    del: jest.fn(),
    patch: jest.fn(),
    put: jest.fn(),
    head: jest.fn(),
    connect: jest.fn(),
    trace: jest.fn(),
    any: jest.fn(),
    ws: jest.fn(),
    publish: jest.fn()
  }
})

describe('handler', () => {
  it('should set res.aborted to true, if res is onAborted', async () => {
    // eslint-disable-next-line no-console
    const originalConsoleError = console.error
    // eslint-disable-next-line no-console
    console.error = jest.fn()
    const h: ton.TonHandler = () => ''
    mockRes.onAborted = jest.fn(fn => {
      fn()
      return mockRes
    })
    const inner = ton.handler(h)
    await inner(mockRes, {} as any)

    expect(mockRes.aborted).toBe(true)
    // eslint-disable-next-line no-console
    expect(console.error).toHaveBeenCalledTimes(1)
    // eslint-disable-next-line no-console
    expect(console.error).toHaveBeenCalledWith(
      ton.create5xxError(500, "Can't send anything after response was aborted")
    )

    // eslint-disable-next-line no-console
    console.error = originalConsoleError
  })

  it('should not auto send, if result is undefined', async () => {
    const h: ton.TonHandler = () => {
      ton.sendText(mockRes, 200, 'data')
    }
    const inner = ton.handler(h)
    await inner(mockRes, {} as any)

    expect(mockRes.aborted).toBe(true)
    expect(mockRes.end).toHaveBeenCalledWith('data')
  })

  it('should auto send, if result is not undefined', async () => {
    const h: ton.TonHandler = () => 'data'
    const inner = ton.handler(h)
    await inner(mockRes, {} as any)

    expect(mockRes.aborted).toBe(true)
    expect(mockRes.end).toHaveBeenCalledWith('data')
  })
})

describe('route', () => {
  it('should set the route', () => {
    const mockHandler: ton.TonHandler = jest.fn()
    ton.route(mockApp, 'any', '/*', mockHandler)
    expect(mockApp.any).toBeCalledTimes(1)
    expect((mockApp.any as jest.Mock).mock.calls[0][0]).toBe('/*')
  })
})

describe('createApp', () => {
  it('should create the app', () => {
    const app = ton.createApp()
    expect(app).toEqual(uWS.App())
  })

  it('should create the ssl app', () => {
    const app = ton.createApp({ ssl: true })
    expect(app).toEqual(uWS.SSLApp({}))
  })
})

describe('listen', () => {
  it('should listen on port 3000', async () => {
    const port = 3000
    const app = ton.createApp()
    const token = await ton.listen(app, '0.0.0.0', port)
    expect(await checkPortInUse(port)).toBe(true)
    ton.close(token)
  })

  it('should listen and return the token', async () => {
    mockApp.listen = jest.fn((host, port, cb) => cb('token')) as any
    const token = await ton.listen(mockApp, '', 0)
    expect(token).toBe('token')
  })

  it('should throw the error if missing token', async () => {
    const port = 3000
    const host = 'asdf'
    const app = ton.createApp()
    await expect(ton.listen(app, host, port)).rejects.toThrowError(
      'missing token'
    )
  })
})

describe('close', () => {
  it('should close app', async () => {
    const port = 3000
    const app = ton.createApp()
    const token = await ton.listen(app, '0.0.0.0', port)
    expect(await checkPortInUse(port)).toBe(true)
    ton.close(token)
    expect(await checkPortInUse(port)).toBe(false)
  })
})

describe('registerGracefulShutdown', () => {
  const originalProcessOn = process.on
  // eslint-disable-next-line no-console
  const originalConsoleInfo = console.info

  beforeEach(() => {
    process.on = jest.fn((event, listener) => listener()) as any
    // eslint-disable-next-line no-console
    console.info = jest.fn()
  })

  afterAll(() => {
    process.on = originalProcessOn
    // eslint-disable-next-line no-console
    console.info = originalConsoleInfo
  })

  it('should graceful sutdown', async () => {
    const port = 3000
    const app = ton.createApp()
    const token = await ton.listen(app, '0.0.0.0', port)
    expect(await checkPortInUse(port)).toBe(true)
    ton.registerGracefulShutdown(token)
    // eslint-disable-next-line no-console
    expect(console.info).toBeCalledWith(
      'Gracefully shutting down. Please wait...'
    )
    expect(await checkPortInUse(port)).toBe(false)
  })
})
