export interface TonCache {
  set(key: string, value: any, options?: { ttl?: number }): Promise<void>
  get(key: string): Promise<void>
  del(key: string): Promise<void>
  reset(): Promise<void>
  has(key: string): Promise<boolean>
}

export function set(
  cache: TonCache,
  key: string,
  value: any,
  options?: { ttl: number }
) {
  return cache.set(key, value, options)
}

export function get(cache: TonCache, key: string) {
  return cache.get(key)
}

export function del(cache: TonCache, key: string) {
  return cache.del(key)
}

export function reset(cache: TonCache) {
  return cache.reset()
}

export function has(cache: TonCache, key: string) {
  return cache.has(key)
}
