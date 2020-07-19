import LRU from 'lru-cache'
import { TonCache } from './index'

export class LRUCache implements TonCache {
  store: LRU<string, any>

  constructor(options: LRU.Options<string, any>) {
    this.store = new LRU(options)
  }

  async set(key: string, value: any, options: { ttl: number } = { ttl: 0 }) {
    if (options.ttl > 0) {
      this.store.set(key, value, options.ttl * 1000)
      return undefined
    }
    this.store.set(key, value)
    return undefined
  }

  async get(key: string) {
    return this.store.get(key)
  }

  async del(key: string) {
    return this.store.del(key)
  }

  async reset() {
    return this.store.reset()
  }

  async has(key: string) {
    return this.store.has(key)
  }
}

export function createCache(options?: LRU.Options<string, any>) {
  return new LRUCache(options)
}
