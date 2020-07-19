/* eslint-disable lines-between-class-members */
import IORedis, { RedisOptions, Redis } from 'ioredis'
import { TonCache } from './index'

export class RedisCache implements TonCache {
  store: Redis

  constructor(port?: number, host?: string, options?: RedisOptions)
  constructor(host?: string, options?: RedisOptions)
  constructor(options?: RedisOptions)
  constructor(...args: any[]) {
    this.store = new IORedis(...args)
  }

  async set(key: string, value: any, options: { ttl: number } = { ttl: 0 }) {
    if (options.ttl > 0) {
      await this.store.setex(key, options.ttl, JSON.stringify(value))
      return undefined
    }
    await this.store.set(key, JSON.stringify(value))
    return undefined
  }

  async get(key: string) {
    return (await this.store.get(JSON.parse(key))) || Promise.resolve(undefined)
  }

  async del(key: string) {
    await this.store.del(key)
  }

  async reset() {
    await this.store.flushdb()
  }

  async has(key: string) {
    return !!this.store.exists(key)
  }
}

export function createCache(
  port?: number,
  host?: string,
  options?: RedisOptions
): RedisCache
export function createCache(host?: string, options?: RedisOptions): RedisCache
export function createCache(options?: RedisOptions): RedisCache
export function createCache(...args: any[]): RedisCache {
  return new RedisCache(...args)
}
