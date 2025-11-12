'use client'

import { useState, useEffect, useCallback } from 'react'
import { optimizedVideoAPI } from '@/lib/optimizedApi'
import OptimizedVideoCard from './OptimizedVideoCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { TrendingUp } from 'lucide-react'

interface Video {
  _id: string
  title: string
  description: string
  thumbnailUrl: string
  videoUrl: string
  views: number
  likes: number
  duration: number
  uploadedAt: string
  category: {
    _id: string
    name: string
    slug: string
    color: string
    icon: string
  }
  trendingScore?: number
}

interface TrendingVideosProps {
  limit?: number
}


export default function TrendingVideos({ limit = 8 }: TrendingVideosProps) {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTrendingVideos = useCallback(async () => {
    try {
      setLoading(true)
      
      const response = await optimizedVideoAPI.getTrending(limit)
      const videosData = response.data.videos || []
      
      setVideos(videosData)
    } catch (error: any) {
      console.error('Error fetching trending videos:', error)
      setError('Failed to load trending videos')
      setVideos([])
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    fetchTrendingVideos()
  }, [fetchTrendingVideos])


  if (loading) {
    return (
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return null
  }

  if (videos.length === 0 && !loading) {
    return (
      <section className="py-8 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="h-6 w-6 text-gray-400" />
            <h2 className="text-xl font-bold text-gray-400">No Trending Videos</h2>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-8">
          <TrendingUp className="h-8 w-8 text-white" />
          <h2 className="text-3xl font-bold text-white">Trending Now</h2>
        </div>

        {/* Video Grid with Lazy Loading */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {videos.slice(0, 8).map((video, index) => (
            <div 
              key={video._id}
              className="animate-fade-in"
              style={{ 
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'both'
              }}
            >
              <OptimizedVideoCard video={video} priority={index < 4} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
