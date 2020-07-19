import { TonCache } from './index'

export class MemoryCache implements TonCache {
  store: object = {}

  async set(key: string, value: any, options: { ttl: number } = { ttl: 0 }) {
    this.store[key] = value
    if (options.ttl > 0) {
      setTimeout(() => this.del(key), options.ttl * 1000)
    }
  }

  async get(key: string) {
    return this.store[key]
  }

  async del(key: string) {
    delete this.store[key]
  }

  async reset() {
    Object.keys(this.store).forEach(this.del.bind(this))
  }

  async has(key: string) {
    return !!this.store[key]
  }
}

export function createCache() {
  return new MemoryCache()
}
