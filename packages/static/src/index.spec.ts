import { join } from 'path'
import fs from 'fs'
import { Readable } from 'stream'
import { TonRequest, TonResponse, TonStatusCodes, TonStream } from '@tonjs/ton'
import { TonHandler } from '@tonjs/ton/src'
import { createHandler, createStatic, createStaticStream } from './index'

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

describe('createStaticStream', () => {
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
    const stream = createStaticStream(mockPath)
    expect(stream.size).toBe(123)
  })
})

describe('createStatic, createStaticStream', () => {
  const buildHandlerWithOptions = (
    methodType: string,
    route: string,
    doFileExists: boolean,
    root?: string,
    enableDefaultIndex?: boolean
  ): TonHandler => {
    const defultOptions = { root, enableDefaultIndex }
    const staticHandler = createStatic(defultOptions)

    mockReq.getMethod = jest.fn(() => methodType)
    mockReq.getUrl = jest.fn(() => route)
    fs.existsSync = jest.fn(() => doFileExists)
    return staticHandler
  }

  it('should send a response with content type', () => {
    const staticHandler = buildHandlerWithOptions('get', '/index.js', true)
    staticHandler(mockReq, mockRes)
    expect(mockRes.writeStatus).toHaveBeenCalledTimes(0)
    expect(mockRes.writeHeader).toHaveBeenCalledTimes(1)
    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(
      1,
      'Content-Type',
      'application/javascript'
    )
  })

  it('should return 404 response, if path name not valid', () => {
    const staticHandler = buildHandlerWithOptions(
      'get',
      '/%E4%B8%AD%E696%87.txt',
      true
    )
    staticHandler(mockReq, mockRes)
    expect(mockRes.writeStatus).toHaveBeenCalledTimes(1)
    expect(mockRes.writeStatus).toHaveBeenCalledWith(
      `404 ${TonStatusCodes[404]}`
    )
  })

  it('should return 404 response, if request method is not get or head', () => {
    buildHandlerWithOptions('post', '/index.js', true, './')(mockReq, mockRes)
    expect(mockRes.writeStatus).toHaveBeenCalledTimes(1)
    expect(mockRes.writeStatus).toHaveBeenCalledWith(
      `404 ${TonStatusCodes[404]}`
    )
  })

  it('should return 404 response, if path is not a file', () => {
    buildHandlerWithOptions('post', '/index', true, './')(mockReq, mockRes)
    expect(mockRes.writeStatus).toHaveBeenCalledTimes(1)
    expect(mockRes.writeStatus).toHaveBeenCalledWith(
      `404 ${TonStatusCodes[404]}`
    )
  })

  it('should find default index file, if request url with a slash at the end', () => {
    const rootPath = '/public'
    const requetRoute = '/index/'
    buildHandlerWithOptions(
      'get',
      requetRoute,
      true,
      rootPath
    )(mockReq, mockRes)
    expect(fs.existsSync).toHaveBeenCalledWith(
      join(rootPath, `${requetRoute}index.html`)
    )
  })

  it(`should return 404 response, when path is not a file and disable default index file`, () => {
    const rootPath = '/public'
    const requetRoute = '/index/'
    buildHandlerWithOptions(
      'get',
      requetRoute,
      true,
      rootPath,
      false
    )(mockReq, mockRes)
    expect(mockRes.writeStatus).toHaveBeenCalledTimes(1)
    expect(mockRes.writeStatus).toHaveBeenCalledWith(
      `404 ${TonStatusCodes[404]}`
    )
  })

  it('should return 404 response, if file not found', () => {
    const rootPath = '/public'
    const requetRoute = '/index/someFileNeverExists'
    buildHandlerWithOptions(
      'get',
      requetRoute,
      false,
      rootPath
    )(mockReq, mockRes)
    expect(mockRes.writeStatus).toHaveBeenCalledTimes(1)
    expect(mockRes.writeStatus).toHaveBeenCalledWith(
      `404 ${TonStatusCodes[404]}`
    )
  })

  it(`should set Content-Type to application/octet-stream,\
if file extension name as empty`, () => {
    const rootPath = '/public'
    const requetRoute = '/index/someFileNeverExists'
    mockReq.getUrl = jest.fn(() => '')
    buildHandlerWithOptions(
      'get',
      requetRoute,
      true,
      rootPath,
      false
    )(mockReq, mockRes)
    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(
      1,
      'Content-Type',
      'application/octet-stream'
    )
  })
})
