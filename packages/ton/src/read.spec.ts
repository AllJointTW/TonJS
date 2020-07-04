import * as ton from './index'

let mockReq: ton.TonRequest
let mockRes: ton.TonResponse

const originalData = { key: 'value' }
const data = JSON.stringify(originalData)
const chunk = Buffer.from(data)
const chunkIndex = [0, 1, 2, 3, 4]
const splitChunk: Buffer[] = chunkIndex.reduce((acc, curr) => {
  const start = (data.length * curr) / chunkIndex.length
  const end = (data.length * (curr + 1)) / chunkIndex.length
  acc.push(Buffer.from(data.substring(start, end)))
  return acc
}, [])

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

  it('should throw the 413 error, if buffer over limit', async () => {
    mockRes.onData = fn => {
      fn(chunk, true)
      return mockRes
    }

    await expect(ton.readBuffer(mockRes, { limit: '0b' })).rejects.toThrow(
      ton.create4xxError(413, ton.TonStatusCodes[413])
    )
  })

  it('should bypass the buffer concat, if buffer over limit', async () => {
    mockRes.onData = fn => {
      fn(chunk, true)
      fn(chunk, true)
      return mockRes
    }

    await expect(ton.readBuffer(mockRes, { limit: '0b' })).rejects.toThrow(
      ton.create4xxError(413, ton.TonStatusCodes[413])
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

  it('should throw 413 error, if buffer over limit', async () => {
    mockRes.onData = fn => {
      fn(chunk, true)
      return mockRes
    }

    await expect(ton.readText(mockRes, { limit: '0b' })).rejects.toThrow(
      ton.create4xxError(413, ton.TonStatusCodes[413])
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

  it('should throw 413 error, if buffer over limit', async () => {
    mockRes.onData = fn => {
      fn(chunk, true)
      return mockRes
    }

    await expect(ton.readJSON(mockRes, { limit: '0b' })).rejects.toThrow(
      ton.create4xxError(413, ton.TonStatusCodes[413])
    )
  })

  it('should throw error if json is invalid', async () => {
    mockRes.onData = fn => {
      fn(Buffer.from('ton'), true)
      return mockRes
    }

    await expect(ton.readJSON(mockRes)).rejects.toThrow(
      ton.create4xxError(400, 'Invalid JSON')
    )
  })
})

describe('readStream', () => {
  it('should read as stream', async () => {
    mockReq.getHeader = jest.fn(() => {
      return chunk.length.toString()
    })
    mockRes.onData = fn => {
      for (let pushCount = 0; pushCount < chunkIndex.length; pushCount += 1) {
        fn(splitChunk[pushCount], pushCount === chunkIndex.length - 1)
      }
      return mockRes
    }
    return new Promise(done => {
      let receiveCount = 0
      const stream = ton.readStream(mockReq, mockRes)
      stream.on('data', receiveChunk => {
        expect(receiveChunk.toString()).toBe(
          splitChunk[receiveCount].toString()
        )
        receiveCount += 1
        if (receiveCount < splitChunk.length) {
          done()
        }
      })
    })
  })

  it('should return null, if read of body stream be called.', async () => {
    const stream = ton.readStream(mockReq, mockRes)
    expect(stream.read()).toBe(null)
  })

  it('should set the body size dynamic, if content length is fake', async () => {
    mockReq.getHeader = jest.fn(() => {
      return (chunk.length - 10).toString()
    })
    mockRes.onData = fn => {
      for (let pushCount = 0; pushCount < chunkIndex.length; pushCount += 1) {
        fn(splitChunk[pushCount], pushCount === chunkIndex.length - 1)
      }
      return mockRes
    }
    return new Promise(done => {
      let receiveCount = 0
      const stream = ton.readStream(mockReq, mockRes)
      stream.on('data', () => {
        receiveCount += 1
        if (receiveCount < splitChunk.length) {
          expect(stream.size).toBe(chunk.length)
          done()
        }
      })
    })
  })

  it(`should throw the 413 error and bypass the redundant chunk, \
if stream size is bigger than size`, async () => {
    mockReq.getHeader = jest.fn(() => {
      return chunk.length.toString()
    })
    mockRes.onData = fn => {
      for (let pushCount = 0; pushCount < chunkIndex.length; pushCount += 1) {
        fn(splitChunk[pushCount], pushCount === chunkIndex.length - 1)
      }
      return mockRes
    }
    return new Promise(done => {
      let totalReceiveChunk = Buffer.allocUnsafe(0)
      const targetChunkIndex = 3
      const stream = ton.readStream(mockReq, mockRes, {
        limit: `${(chunk.length * targetChunkIndex) / 5}b`
      })
      stream.on('error', (err: ton.TonError) => {
        expect(err.statusCode).toBe(413)
        expect(err.message).toBe(ton.TonStatusCodes[413])
        expect(totalReceiveChunk.toString()).toBe('')
        done()
      })
      stream.on('data', receiveChunk => {
        totalReceiveChunk = Buffer.concat([...totalReceiveChunk, receiveChunk])
      })
    })
  })
})
