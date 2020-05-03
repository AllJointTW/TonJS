// eslint-disable-next-line import/no-extraneous-dependencies
import axios from 'axios'
import path from 'path'
import { TonApp, TonListenSocket, close } from '@tonjs/ton'
import bin from './index'

let logLevel = process.env.LOG_LEVEL
let instance: { app: TonApp; token: TonListenSocket }

beforeAll(() => {
  logLevel = process.env.LOG_LEVEL
  process.env.LOG_LEVEL = 'silent'
})

afterAll(() => {
  if (logLevel) {
    process.env.LOG_LEVEL = logLevel
  }
})

afterEach(() => {
  close(instance.token)
})

describe('e2e', () => {
  it('should import TonHandler TS', async () => {
    instance = await bin({
      host: '0.0.0.0',
      port: 4000,
      _: ['packages/bin/e2e/single.ts']
    })
    expect(instance.token).not.toBe(undefined)
    const { data, status } = await axios.get('http://0.0.0.0:4000')
    expect(status).toBe(200)
    expect(data).toBe('Hi There!')
  })

  it('should import TonHandler JS', async () => {
    instance = await bin({
      host: '0.0.0.0',
      port: 4000,
      _: ['packages/bin/e2e/single.js']
    })
    expect(instance.token).not.toBe(undefined)
    const { data, status } = await axios.get('http://0.0.0.0:4000')
    expect(status).toBe(200)
    expect(data).toBe('Hi There!')
  })

  it('should import TonRoute TS', async () => {
    instance = await bin({
      host: '0.0.0.0',
      port: 4000,
      _: ['packages/bin/e2e/route.ts']
    })
    expect(instance.token).not.toBe(undefined)
    const { data, status } = await axios.get('http://0.0.0.0:4000')
    expect(status).toBe(200)
    expect(data).toBe('Hi There!')
  })

  it('should import TonRoute JS', async () => {
    instance = await bin({
      host: '0.0.0.0',
      port: 4000,
      _: ['packages/bin/e2e/route.js']
    })
    expect(instance.token).not.toBe(undefined)
    const { data, status } = await axios.get('http://0.0.0.0:4000')
    expect(status).toBe(200)
    expect(data).toBe('Hi There!')
  })

  it('should import TonRoutes TS', async () => {
    instance = await bin({
      host: '0.0.0.0',
      port: 4000,
      _: ['packages/bin/e2e/routes.ts']
    })
    expect(instance.token).not.toBe(undefined)

    const resRoot = await axios.get('http://0.0.0.0:4000')
    expect(resRoot.status).toBe(200)
    expect(resRoot.data).toBe('TonJS')

    const resEmpty = await axios.get('http://0.0.0.0:4000/empty')
    expect(resEmpty.status).toBe(204)

    const resPing = await axios.get('http://0.0.0.0:4000/ping')
    expect(resPing.status).toBe(200)
    expect(resPing.data).toEqual({ result: 'pong' })
  })

  it('should import TonRoutes JS', async () => {
    instance = await bin({
      host: '0.0.0.0',
      port: 4000,
      _: ['packages/bin/e2e/routes.js']
    })
    expect(instance.token).not.toBe(undefined)

    const resRoot = await axios.get('http://0.0.0.0:4000')
    expect(resRoot.status).toBe(200)
    expect(resRoot.data).toBe('TonJS')

    const resEmpty = await axios.get('http://0.0.0.0:4000/empty')
    expect(resEmpty.status).toBe(204)

    const resPing = await axios.get('http://0.0.0.0:4000/ping')
    expect(resPing.status).toBe(200)
    expect(resPing.data).toEqual({ result: 'pong' })
  })

  it('should use index.js as default entry', async () => {
    try {
      await bin({ host: '0.0.0.0', port: 4000, _: [] })
    } catch (err) {
      // eslint-disable-next-line jest/no-try-expect
      expect(err.moduleName).toBe(path.resolve(process.cwd(), 'index.js'))
    }
  })
})
