// eslint-disable-next-line import/no-extraneous-dependencies
import axios from 'axios'
import path from 'path'
import { close } from '@tonjs/ton'
import bin, { TonBinInstance } from './index'

const logLevel = process.env.LOG_LEVEL
process.env.LOG_LEVEL = 'silent'

let instance: TonBinInstance
const { exit } = process

afterAll(() => {
  if (logLevel) {
    process.env.LOG_LEVEL = logLevel
  } else {
    delete process.env.LOG_LEVEL
  }
  process.exit = exit
})

afterEach(() => {
  close(instance.token)
  process.exit = jest.fn() as any
})

describe('e2e', () => {
  it('should import TonHandler TS', async () => {
    instance = (await bin({
      host: '0.0.0.0',
      port: 4000,
      _: ['packages/bin/e2e/single.ts']
    })) as TonBinInstance
    expect(instance.token).not.toBe(undefined)
    const { data, status } = await axios.get('http://0.0.0.0:4000')
    expect(status).toBe(200)
    expect(data).toBe('Hi There!')
  })

  it('should import TonHandler JS', async () => {
    instance = (await bin({
      host: '0.0.0.0',
      port: 4000,
      _: ['packages/bin/e2e/single.js']
    })) as TonBinInstance
    expect(instance.token).not.toBe(undefined)
    const { data, status } = await axios.get('http://0.0.0.0:4000')
    expect(status).toBe(200)
    expect(data).toBe('Hi There!')
  })

  it('should import TonRoute TS', async () => {
    instance = (await bin({
      host: '0.0.0.0',
      port: 4000,
      _: ['packages/bin/e2e/route.ts']
    })) as TonBinInstance
    expect(instance.token).not.toBe(undefined)
    const { data, status } = await axios.get('http://0.0.0.0:4000')
    expect(status).toBe(200)
    expect(data).toBe('Hi There!')
  })

  it('should import TonRoute JS', async () => {
    instance = (await bin({
      host: '0.0.0.0',
      port: 4000,
      _: ['packages/bin/e2e/route.js']
    })) as TonBinInstance
    expect(instance.token).not.toBe(undefined)
    const { data, status } = await axios.get('http://0.0.0.0:4000')
    expect(status).toBe(200)
    expect(data).toBe('Hi There!')
  })

  it('should import TonRoutes TS', async () => {
    instance = (await bin({
      host: '0.0.0.0',
      port: 4000,
      _: ['packages/bin/e2e/routes.ts']
    })) as TonBinInstance
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
    instance = (await bin({
      host: '0.0.0.0',
      port: 4000,
      _: ['packages/bin/e2e/routes.js']
    })) as TonBinInstance
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

  it(`should use index.js as default entry.
index.js is missing, will exit with 1`, async () => {
    const error: any = await bin({ host: '0.0.0.0', port: 4000, _: [] })
    expect(error.moduleName).toBe(path.resolve(process.cwd(), 'index.js'))
    expect(process.exit).toBeCalledWith(1)
  })
})
