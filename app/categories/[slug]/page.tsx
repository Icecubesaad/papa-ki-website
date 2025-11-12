'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { categoryAPI, videoAPI } from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { 
  ArrowLeft, 
  Video, 
  Eye, 
  Heart, 
  Calendar,
  Filter,
  Grid,
  List
} from 'lucide-react'
import Link from 'next/link'

interface Category {
  _id: string
  name: string
  slug: string
  description: string
  videoCount: number
}

interface VideoItem {
  _id: string
  title: string
  description: string
  thumbnailUrl: string
  views: number
  likes: number
  uploadedAt: string
  duration?: string
}

const CategoryPage: React.FC = () => {
  const params = useParams()
  const slug = params.slug as string
  
  const [category, setCategory] = useState<Category | null>(null)
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [videosLoading, setVideosLoading] = useState(false)
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (slug) {
      fetchCategory()
    }
  }, [slug])

  useEffect(() => {
    if (category) {
      fetchVideos()
    }
  }, [category, sortBy, currentPage])

  const fetchCategory = async () => {
    try {
      setLoading(true)
      const response = await categoryAPI.getBySlug(slug)
      setCategory(response.data)
    } catch (error) {
      console.error('Error fetching category:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchVideos = async () => {
    if (!category) return
    
    try {
      setVideosLoading(true)
      const response = await videoAPI.getAll({
        categoryId: category._id,
        sort: sortBy,
        page: currentPage,
        limit: 12
      })
      setVideos(response.data.videos)
      setTotalPages(response.data.pagination.totalPages)
    } catch (error) {
      console.error('Error fetching videos:', error)
    } finally {
      setVideosLoading(false)
    }
  }

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort)
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-metal-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-metal-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-metal-100 mb-4">Category Not Found</h1>
          <p className="text-metal-400 mb-6">The category you're looking for doesn't exist.</p>
          <Link href="/categories" className="btn btn-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-metal-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-900/20 to-nature-900/20 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/categories"
            className="inline-flex items-center text-metal-400 hover:text-primary-500 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-metal-100 mb-4">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-xl text-metal-300 max-w-3xl mx-auto mb-6">
                {category.description}
              </p>
            )}
            <div className="flex items-center justify-center text-metal-400">
              <Video className="h-4 w-4 mr-2" />
              <span>{category.videoCount} videos</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <Filter className="h-4 w-4 text-metal-400" />
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most-viewed">Most Viewed</option>
              <option value="most-liked">Most Liked</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-metal-800 text-metal-400 hover:text-metal-200'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-metal-800 text-metal-400 hover:text-metal-200'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Videos */}
        {videosLoading ? (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-16">
            <Video className="h-16 w-16 text-metal-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-metal-300 mb-2">No videos found</h3>
            <p className="text-metal-500">
              There are no videos in this category yet.
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <>
            <div className="video-grid">
              {videos.map((video) => (
                <Link
                  key={video._id}
                  href={`/video/${video._id}`}
                  className="video-card group"
                >
                  <div className="relative">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="video-thumbnail"
                    />
                    {video.duration && (
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                        {video.duration}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-metal-100 mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-metal-400 text-sm mb-3 line-clamp-2">
                      {video.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-metal-500">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {video.views.toLocaleString()}
                        </span>
                        <span className="flex items-center">
                          <Heart className="h-3 w-3 mr-1" />
                          {video.likes.toLocaleString()}
                        </span>
                      </div>
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(video.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="btn btn-outline btn-sm"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const page = i + 1
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`btn btn-sm ${
                          page === currentPage ? 'btn-primary' : 'btn-outline'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="btn btn-outline btn-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            {videos.map((video) => (
              <Link
                key={video._id}
                href={`/video/${video._id}`}
                className="card-hover group cursor-pointer"
              >
                <div className="p-6 flex items-center">
                  <div className="w-32 h-20 bg-metal-800 rounded-lg overflow-hidden mr-4 flex-shrink-0">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-metal-100 group-hover:text-primary-400 transition-colors mb-2">
                      {video.title}
                    </h3>
                    <p className="text-metal-400 text-sm mb-3 line-clamp-2">
                      {video.description}
                    </p>
                    
                    <div className="flex items-center space-x-6 text-xs text-metal-500">
                      <span className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {video.views.toLocaleString()} views
                      </span>
                      <span className="flex items-center">
                        <Heart className="h-3 w-3 mr-1" />
                        {video.likes.toLocaleString()} likes
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(video.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CategoryPage
