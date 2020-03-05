import { STATUS_CODES } from 'http'
import * as ton from './index'

let mockRes: ton.TonResponse

const originalData = { key: 'value' }
const data = JSON.stringify(originalData)
const chunk = Buffer.from(data)

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

describe('readBuffer', () => {
  it('should read buffer', async () => {
    mockRes.onData = fn => {
      fn(chunk, true)
      return mockRes
    }

    const result = await ton.readBuffer(mockRes)
    expect(result).toStrictEqual(chunk)
  })

  it('should read buffer in split chunk', async () => {
    mockRes.onData = fn => {
      fn(chunk.slice(0, chunk.length * (1 / 3)), false)
      fn(chunk.slice(chunk.length * (1 / 3), chunk.length * (2 / 3)), false)
      fn(chunk.slice(chunk.length * (2 / 3)), true)
      return mockRes
    }

    const result = await ton.readBuffer(mockRes)
    expect(result).toStrictEqual(chunk)
  })

  it('should not read buffer if over limit', async () => {
    mockRes.onData = fn => {
      fn(chunk, true)
      return mockRes
    }

    await expect(ton.readBuffer(mockRes, { limit: '0b' })).rejects.toThrow(
      ton.createError(413, STATUS_CODES[413])
    )
  })
})

describe('readText', () => {
  it('should read text', async () => {
    mockRes.onData = fn => {
      fn(chunk, true)
      return mockRes
    }

    const result = await ton.readText(mockRes)
    expect(result).toEqual(data)
  })

  it('should read text in different encoding (ascii)', async () => {
    mockRes.onData = fn => {
      fn(chunk, true)
      return mockRes
    }

    const result = await ton.readText(mockRes, { encoding: 'ascii' })
    expect(result).toEqual(data)
  })

  it('should read text in split chunk', async () => {
    mockRes.onData = fn => {
      fn(chunk.slice(0, chunk.length * (1 / 3)), false)
      fn(chunk.slice(chunk.length * (1 / 3), chunk.length * (2 / 3)), false)
      fn(chunk.slice(chunk.length * (2 / 3)), true)
      return mockRes
    }

    const result = await ton.readText(mockRes)
    expect(result).toEqual(data)
  })

  it('should not read buffer if over limit', async () => {
    mockRes.onData = fn => {
      fn(chunk, true)
      return mockRes
    }

    await expect(ton.readText(mockRes, { limit: '0b' })).rejects.toThrow(
      ton.createError(413, STATUS_CODES[413])
    )
  })
})

describe('readJSON', () => {
  it('should read json', async () => {
    mockRes.onData = fn => {
      fn(chunk, true)
      return mockRes
    }

    const result = await ton.readJSON(mockRes)
    expect(result).toEqual(originalData)
  })

  it('should read json in different encoding (ascii)', async () => {
    mockRes.onData = fn => {
      fn(chunk, true)
      return mockRes
    }

    const result = await ton.readJSON(mockRes, { encoding: 'ascii' })
    expect(result).toEqual(originalData)
  })

  it('should read text in split chunk', async () => {
    mockRes.onData = fn => {
      fn(chunk.slice(0, chunk.length * (1 / 3)), false)
      fn(chunk.slice(chunk.length * (1 / 3), chunk.length * (2 / 3)), false)
      fn(chunk.slice(chunk.length * (2 / 3)), true)
      return mockRes
    }

    const result = await ton.readJSON(mockRes)
    expect(result).toEqual(originalData)
  })

  it('should not read buffer if over limit', async () => {
    mockRes.onData = fn => {
      fn(chunk, true)
      return mockRes
    }

    await expect(ton.readJSON(mockRes, { limit: '0b' })).rejects.toThrow(
      ton.createError(413, STATUS_CODES[413])
    )
  })

  it('should throw error if json is invalid', async () => {
    mockRes.onData = fn => {
      fn(Buffer.from('ton'), true)
      return mockRes
    }

    await expect(ton.readJSON(mockRes)).rejects.toThrow(
      ton.createError(400, 'Invalid JSON')
    )
  })
})
