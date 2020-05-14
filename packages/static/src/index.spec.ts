import { join } from 'path'
import fs from 'fs'
import { Readable } from 'stream'
import { TonRequest, TonResponse, TonStatusCodes, TonStream } from '@tonjs/ton'
import { TonHandler } from '@tonjs/ton/src'
import { sendStaticStream, createStaticHandler } from './index'

jest.mock('fs')

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

describe('sendStaticStream', () => {
  let mockStream: TonStream = new Readable()
  const buffer = Buffer.from('asdf')
  const mockPath = 'mockPath'

  beforeEach(() => {
    mockStream = new Readable()
    mockStream = new Readable()
    // eslint-disable-next-line @typescript-eslint/no-empty-function, no-underscore-dangle
    mockStream._read = function read() {}
    mockStream.destroy = jest.fn()
    mockStream.resume = jest.fn()
    mockStream.pause = jest.fn()
    mockStream.size = buffer.length
  })

  it('should send a response with content type', () => {
    fs.createReadStream = jest.fn(() => mockStream as any)
    fs.statSync = jest.fn(() => {
      return {
        size: 123
      } as any
    })
    sendStaticStream(mockPath, mockRes)
    expect(mockRes.writeStatus).toHaveBeenCalledTimes(0)
    expect(mockRes.writeHeader).toHaveBeenCalledTimes(1)
    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(1, 'Content-Type', null)
  })
})

describe('createStaticHandler', () => {
  const buildStaticHandler = (
    methodType: string,
    route: string,
    doFileExists: boolean,
    root?: string
  ): TonHandler => {
    const defultOptions = { root }
    const staticHandler = createStaticHandler(defultOptions)

    mockReq.getMethod = jest.fn(() => methodType)
    mockReq.getUrl = jest.fn(() => route)
    fs.existsSync = jest.fn(() => doFileExists)
    return staticHandler
  }

  it('should send a response with content type', () => {
    const staticHandler = buildStaticHandler('get', '/index.js', true)
    staticHandler(mockReq, mockRes)
    expect(mockRes.writeStatus).toHaveBeenCalledTimes(0)
    expect(mockRes.writeHeader).toHaveBeenCalledTimes(1)
    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(
      1,
      'Content-Type',
      'application/javascript'
    )
  })

  it('should return 404 response, if request method is not get or head', () => {
    buildStaticHandler('post', '/index.js', true, './')(mockReq, mockRes)
    expect(mockRes.writeStatus).toHaveBeenCalledTimes(1)
    expect(mockRes.writeStatus).toHaveBeenCalledWith(
      `404 ${TonStatusCodes[404]}`
    )
  })

  it('should return 404 response, if path is not a file', () => {
    buildStaticHandler('post', '/index', true, './')(mockReq, mockRes)
    expect(mockRes.writeStatus).toHaveBeenCalledTimes(1)
    expect(mockRes.writeStatus).toHaveBeenCalledWith(
      `404 ${TonStatusCodes[404]}`
    )
  })

  it('should find default index file, if request url with a slash at the end', () => {
    const rootPath = '/public'
    const requetRoute = '/index/'
    buildStaticHandler('get', requetRoute, true, rootPath)(mockReq, mockRes)
    expect(fs.existsSync).toHaveBeenCalledWith(
      join(rootPath, `${requetRoute}index.html`)
    )
  })

  it('should return 404 response, if file not found', () => {
    const rootPath = '/public'
    const requetRoute = '/index/someFileNeverExists'
    buildStaticHandler('get', requetRoute, false, rootPath)(mockReq, mockRes)
    expect(mockRes.writeStatus).toHaveBeenCalledTimes(1)
    expect(mockRes.writeStatus).toHaveBeenCalledWith(
      `404 ${TonStatusCodes[404]}`
    )
  })
})
