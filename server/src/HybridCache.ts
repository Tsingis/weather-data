import NodeCache from "node-cache"
import { type RedisClientType } from "@redis/client"

type CacheOptions = {
  l1Ttl?: number
  l2Ttl?: number
  prefix?: string
}

export class HybridCache {
  private readonly l1: NodeCache
  private readonly l2: RedisClientType
  private readonly options: Required<CacheOptions>

  constructor(redisClient: RedisClientType, options?: CacheOptions) {
    this.l2 = redisClient
    this.options = {
      l1Ttl: options?.l1Ttl ?? 60,
      l2Ttl: options?.l2Ttl ?? 300,
      prefix: options?.prefix ?? "hybrid:",
    }

    this.l1 = new NodeCache({
      stdTTL: this.options.l1Ttl,
      checkperiod: this.options.l1Ttl * 2,
    })
  }

  private getKey(key: string): string {
    return `${this.options.prefix}${key}`
  }

  async get<T>(
    key: string
  ): Promise<{ value: T | null; source: "l1" | "l2" | "miss" }> {
    const cacheKey = this.getKey(key)

    const l1Value = this.l1.get<T>(cacheKey)
    if (l1Value !== undefined) {
      return { value: l1Value, source: "l1" }
    }

    const l2Value = await this.l2.get(cacheKey)
    if (l2Value !== null) {
      const parsed = JSON.parse(l2Value) as T
      this.l1.set(cacheKey, parsed)
      return { value: parsed, source: "l2" }
    }

    return { value: null, source: "miss" }
  }

  async set<T>(key: string, value: T): Promise<void> {
    const cacheKey = this.getKey(key)
    const serialized = JSON.stringify(value)

    this.l1.set(cacheKey, value)
    await this.l2.setEx(cacheKey, this.options.l2Ttl, serialized)
  }

  async remove(key: string): Promise<void> {
    const cacheKey = this.getKey(key)
    this.l1.del(cacheKey)
    await this.l2.del(cacheKey)
  }

  async clear(): Promise<void> {
    this.l1.flushAll()
    await this.l2.flushAll()
  }
}
