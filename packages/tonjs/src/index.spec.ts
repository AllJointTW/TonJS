import { STATUS_CODES } from 'http'
import { writeStatus } from './index'

describe('writeStatus', () => {
  it('should write status 204', () => {
    const statusCode = 204
    const mockRes: any = {
      writeStatus: jest.fn()
    }
    writeStatus(mockRes, statusCode)
    expect(mockRes.writeStatus.mock.calls.length).toBe(1)
    expect(mockRes.writeStatus.mock.calls[0][0]).toBe(
      `${statusCode} ${STATUS_CODES[statusCode]}`
    )
  })

  it('should not write status 200, bypass it', () => {
    const statusCode = 200
    const mockRes: any = {
      writeStatus: jest.fn()
    }
    writeStatus(mockRes, statusCode)
    expect(mockRes.writeStatus.mock.calls.length).toBe(0)
  })
})
