'use client'

import React, { useState, useEffect } from 'react'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import Link from 'next/link'
import { optimizedVideoAPI, optimizedCategoryAPI, preloadCriticalData } from '@/lib/optimizedApi'
import OptimizedVideoCard from '@/components/video/OptimizedVideoCard'
import AdaptiveVideoGrid from '@/components/video/AdaptiveVideoGrid'
import CategoryFilter from '@/components/video/CategoryFilter'
import TrendingVideos from '@/components/video/TrendingVideos'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import AdSenseSlot from '@/components/ads/AdSenseSlot'
import { Play, TrendingUp, Clock, Eye, Grid3X3 } from 'lucide-react'

interface Video {
  _id: string
  title: string
  description: string
  videoUrl: string
  thumbnailUrl: string
  category: {
    _id: string
    name: string
    slug: string
    color: string
    icon: string
  }
  views: number
  likes: number
  uploadedAt: string
  duration: number
  dimensions?: {
    width: number
    height: number
    aspectRatio: string
    orientation: 'landscape' | 'portrait' | 'square'
  }
  quality?: {
    resolution: string
    bitrate: number
    fps: number
    codec: string
  }
}

interface Category {
  _id: string
  name: string
  slug: string
  color: string
  icon: string
  videoCount: number
}

const HomePage: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalVideos, setTotalVideos] = useState(0)

  useEffect(() => {
    // Preload critical data
    preloadCriticalData()
    
    fetchCategories()
    fetchVideos(1, selectedCategory)
  }, [selectedCategory])

  const fetchCategories = async () => {
    try {
      const response = await optimizedCategoryAPI.getAll()
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchVideos = async (pageNum: number, categoryId?: string) => {
    try {
      setLoading(pageNum === 1)
      const params: any = { page: pageNum, limit: 16 } // Increased for better grid fill
      if (categoryId) params.category = categoryId

      const response = await optimizedVideoAPI.getAll(params)
      const { videos: newVideos, pagination } = response.data

      if (pageNum === 1) {
        setVideos(newVideos)
      } else {
        setVideos(prev => [...prev, ...newVideos])
      }

      setHasMore(pagination.hasNextPage)
      setTotalVideos(pagination.totalVideos)
      setPage(pageNum)
    } catch (error) {
      console.error('Error fetching videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setPage(1)
  }

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchVideos(page + 1, selectedCategory)
    }
  }

  const { loadMoreRef } = useInfiniteScroll({
    hasMore,
    loading,
    onLoadMore: loadMore
  })

  const selectedCategoryName = selectedCategory 
    ? categories.find(cat => cat._id === selectedCategory)?.name 
    : 'All Videos'

  return (
    <div className="min-h-screen bg-black">
      {/* Trending Videos Section (replaces hero) */}
      <TrendingVideos limit={8} />

      {/* AdSense Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <AdSenseSlot 
          slot="banner-top"
          format="horizontal"
          className="h-20"
        />
      </div>

      {/* Main Content - YouTube-like Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Category Filter - YouTube Style */}
        <div className="mb-6">
          <div className="sticky top-0 bg-black z-10 pb-4">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
          </div>
        </div>
        
        {/* Section Title */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Grid3X3 className="h-5 w-5 mr-2" />
            {selectedCategoryName}
          </h2>
          <div className="text-sm text-gray-400">
            {totalVideos} video{totalVideos !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Videos Grid */}
        {loading && page === 1 ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {videos.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
                  <Play className="h-12 w-12 text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No videos found</h3>
                <p className="text-gray-400 mb-6">
                  {selectedCategory 
                    ? 'No videos in this category yet. Try selecting a different category.'
                    : 'No videos have been uploaded yet. Check back later!'
                  }
                </p>
                {selectedCategory && (
                  <button
                    onClick={() => handleCategoryChange('')}
                    className="btn btn-primary btn-md"
                  >
                    View All Videos
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Adaptive Video Grid */}
                <AdaptiveVideoGrid videos={videos} />
                
                {/* AdSense slots between video sections */}
                {videos.length > 10 && (
                  <div className="my-8">
                    <AdSenseSlot 
                      slot="inline-grid"
                      format="horizontal"
                      className="h-20"
                    />
                  </div>
                )}

                {/* Infinite Scroll Trigger */}
                <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
                  {loading && hasMore && (
                    <div className="flex items-center space-x-2 text-gray-400">
                      <LoadingSpinner size="sm" />
                      <span>Loading more videos...</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Bottom AdSense Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdSenseSlot 
          slot="banner-bottom"
          format="horizontal"
          className="h-24"
        />
      </div>
    </div>
  )
}

export default HomePage
