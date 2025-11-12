import { videoAPI, categoryAPI } from './api'
import { cache, cacheKeys } from './cache'

// Optimized video API with intelligent caching
export const optimizedVideoAPI = {
  // Get all videos with smart caching
  async getAll(params?: any) {
    const cacheKey = cacheKeys.videos(params)
    
    // Try cache first
    const cached = cache.get(cacheKey)
    if (cached) {
      return { data: cached, fromCache: true }
    }

    // Fetch from API
    const response = await videoAPI.getAll(params)
    
    // Cache with shorter TTL for paginated results
    cache.set(cacheKey, response.data, 3 * 60 * 1000) // 3 minutes
    
    return { data: response.data, fromCache: false }
  },

  // Get trending videos with aggressive caching
  async getTrending(limit?: number) {
    const cacheKey = cacheKeys.trending(limit || 10)
    
    const cached = cache.get(cacheKey)
    if (cached) {
      return { data: cached, fromCache: true }
    }

    const response = await videoAPI.getTrending(limit)
    
    // Cache trending for 90 seconds (they change frequently)
    cache.set(cacheKey, response.data, 90 * 1000)
    
    return { data: response.data, fromCache: false }
  },

  // Get single video with long caching
  async getById(id: string) {
    const cacheKey = cacheKeys.video(id)
    
    const cached = cache.get(cacheKey)
    if (cached) {
      return { data: cached, fromCache: true }
    }

    const response = await videoAPI.getById(id)
    
    // Cache individual videos for 15 minutes
    cache.set(cacheKey, response.data, 15 * 60 * 1000)
    
    return { data: response.data, fromCache: false }
  },

  // Get recommendations with caching
  async getRecommendations(id: string, limit?: number) {
    const cacheKey = cacheKeys.recommendations(id, limit || 8)
    
    const cached = cache.get(cacheKey)
    if (cached) {
      return { data: cached, fromCache: true }
    }

    const response = await videoAPI.getRecommendations(id, limit)
    
    // Cache recommendations for 10 minutes
    cache.set(cacheKey, response.data, 10 * 60 * 1000)
    
    return { data: response.data, fromCache: false }
  },

  // Like video (invalidate related caches)
  async like(id: string) {
    const response = await videoAPI.like(id)
    
    // Invalidate related caches
    cache.delete(cacheKeys.video(id))
    // Clear trending cache as likes affect trending
    cache.delete(cacheKeys.trending(8))
    cache.delete(cacheKeys.trending(10))
    
    return response
  },

  // Pass through methods
  create: videoAPI.create,
  update: videoAPI.update,
  delete: videoAPI.delete,
  getAdminVideos: videoAPI.getAdminVideos
}

// Optimized category API
export const optimizedCategoryAPI = {
  async getAll() {
    const cacheKey = cacheKeys.categories()
    
    const cached = cache.get(cacheKey)
    if (cached) {
      return { data: cached, fromCache: true }
    }

    const response = await categoryAPI.getAll()
    
    // Cache categories for 30 minutes (they rarely change)
    cache.set(cacheKey, response.data, 30 * 60 * 1000)
    
    return { data: response.data, fromCache: false }
  },

  // Pass through admin methods
  create: categoryAPI.create,
  update: categoryAPI.update,
  delete: categoryAPI.delete,
  getAdminCategories: categoryAPI.getAdminCategories,
  toggle: categoryAPI.toggle,
  getBySlug: categoryAPI.getBySlug
}

// Preload critical data
export const preloadCriticalData = async () => {
  try {
    await Promise.all([
      optimizedCategoryAPI.getAll(),
      optimizedVideoAPI.getTrending(8)
    ])
  } catch (error) {
    console.warn('Failed to preload critical data:', error)
  }
}

// Background cache warming
export const warmCache = async () => {
  try {
    const promises = [
      optimizedCategoryAPI.getAll(),
      optimizedVideoAPI.getTrending(8),
      optimizedVideoAPI.getAll({ page: 1, limit: 16 })
    ]
    
    await Promise.allSettled(promises)
  } catch (error) {
    console.warn('Cache warming failed:', error)
  }
}
