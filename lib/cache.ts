// Enhanced caching system with TTL and memory management
interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
  hits: number
}

class OptimizedCache {
  private cache = new Map<string, CacheItem<any>>()
  private readonly maxSize = 100
  private readonly defaultTTL = 5 * 60 * 1000 // 5 minutes

  set<T>(key: string, data: T, ttl?: number): void {
    // Clean up if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictLeastUsed()
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      hits: 0
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) return null

    // Check expiration
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    // Increment hit counter
    item.hits++
    return item.data as T
  }

  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Evict least recently used items
  private evictLeastUsed(): void {
    let leastUsedKey = ''
    let leastHits = Infinity
    
    this.cache.forEach((item, key) => {
      if (item.hits < leastHits) {
        leastHits = item.hits
        leastUsedKey = key
      }
    })
    
    if (leastUsedKey) {
      this.cache.delete(leastUsedKey)
    }
  }

  // Cleanup expired items
  cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []
    
    this.cache.forEach((item, key) => {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key)
      }
    })
    
    keysToDelete.forEach(key => this.cache.delete(key))
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRates: Array.from(this.cache.entries()).map(([key, item]) => ({
        key,
        hits: item.hits,
        age: Date.now() - item.timestamp
      }))
    }
  }
}

// Singleton instance
export const cache = new OptimizedCache()

// Auto cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => cache.cleanup(), 5 * 60 * 1000)
}

// Cache key generators
export const cacheKeys = {
  videos: (params: any) => `videos:${JSON.stringify(params)}`,
  video: (id: string) => `video:${id}`,
  categories: () => 'categories',
  trending: (limit: number) => `trending:${limit}`,
  recommendations: (videoId: string, limit: number) => `rec:${videoId}:${limit}`
}
