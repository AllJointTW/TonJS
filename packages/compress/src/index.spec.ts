import { PassThrough, Readable } from 'stream'
import { gzipSync } from 'zlib'
import * as ton from '@tonjs/ton'
import { createCompressMethods, sendCompressedStream } from './index'
import pkg from '../package.json'

let mockReq: ton.TonRequest
let mockRes: ton.TonResponse

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

describe('createCompressMethods', () => {
  it('should create compress methods with my custom', () => {
    const output = createCompressMethods({ custom: new PassThrough() })
    expect(Object.keys(output)).toEqual(['gzip', 'deflate', 'br', 'custom'])
  })
})

describe('sendCompressedStream', () => {
  let mockStream: ton.TonStream = new Readable()
  const buffer = Buffer.from(
    `${JSON.stringify(pkg)}${JSON.stringify(pkg)}${JSON.stringify(
      pkg
    )}${JSON.stringify(pkg)}${JSON.stringify(pkg)}`
  )
  const zipBuffer = gzipSync(buffer)

  beforeEach(() => {
    mockStream = new Readable()
    // eslint-disable-next-line @typescript-eslint/no-empty-function, no-underscore-dangle
    mockStream._read = function read() {}
    mockStream.destroy = jest.fn()
    mockStream.resume = jest.fn()
    mockStream.pause = jest.fn()
    mockStream.size = buffer.length
  })

  it('should compress the stream', () => {
    mockReq.getHeader = jest.fn(() => 'gzip, deflate, br')
    mockRes.write = jest.fn((arrayBuffer: ArrayBuffer) => {
      expect(Buffer.from(arrayBuffer).toString()).toBe(zipBuffer.toString())
      return mockRes
    })
    sendCompressedStream(mockReq, mockRes, 201, mockStream)

    mockStream.emit('data', buffer)
    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(
      1,
      'Content-Type',
      'application/octet-stream'
    )
    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(
      2,
      'Content-Encoding',
      'gzip'
    )
    expect(mockRes.tryEnd).toHaveBeenCalledTimes(0)
  })

  it('should parse the threshold', () => {
    const tinyBuffer = Buffer.from('asdf')
    mockReq.getHeader = jest.fn(() => 'custom')
    mockRes.write = jest.fn((arrayBuffer: ArrayBuffer) => {
      expect(Buffer.from(arrayBuffer).toString()).toBe(tinyBuffer.toString())
      return mockRes
    })
    sendCompressedStream(mockReq, mockRes, 201, mockStream, {
      compressMethods: { custom: new PassThrough() },
      threshold: '0b'
    })

    mockStream.emit('data', tinyBuffer)
    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(
      1,
      'Content-Type',
      'application/octet-stream'
    )
    expect(mockRes.writeHeader).toHaveBeenNthCalledWith(
      2,
      'Content-Encoding',
      'custom'
    )
    expect(mockRes.tryEnd).toHaveBeenCalledTimes(0)
  })

  it('should not compress the stream, if stream size is smaller than threshold', () => {
    const tinyBuffer = Buffer.from('asdf')
    mockReq.getHeader = jest.fn(() => 'gzip, deflate, br')
    mockRes.tryEnd = jest.fn((arrayBuffer: ArrayBuffer, size) => {
      expect(Buffer.from(arrayBuffer).toString()).toBe(tinyBuffer.toString())
      expect(size).toBe(tinyBuffer.length)
      return [false, true]
    })
    mockStream.size = tinyBuffer.length
    sendCompressedStream(mockReq, mockRes, 201, mockStream)
    mockStream.emit('data', tinyBuffer)

    expect(mockStream.destroy).toHaveBeenCalledTimes(1)
  })

  it(`should not compress the stream,
if can not find the methods in accept encoding list`, () => {
    mockReq.getHeader = jest.fn(() => 'gg')
    mockRes.tryEnd = jest.fn((arrayBuffer: ArrayBuffer, size) => {
      expect(Buffer.from(arrayBuffer).toString()).toBe(buffer.toString())
      expect(size).toBe(buffer.length)
      return [false, true]
    })
    mockStream.size = buffer.length
    sendCompressedStream(mockReq, mockRes, 201, mockStream)
    mockStream.emit('data', buffer)

    expect(mockStream.destroy).toHaveBeenCalledTimes(1)
  })
})
