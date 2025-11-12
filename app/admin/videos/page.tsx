'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { videoAPI } from '@/lib/api'
import { 
  Video, 
  Edit, 
  Trash2, 
  Eye, 
  Heart, 
  ArrowLeft,
  Plus,
  Search,
  Filter,
  MoreVertical,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface VideoItem {
  _id: string
  title: string
  description: string
  thumbnailUrl: string
  videoUrl: string
  views: number
  likes: number
  isPublished: boolean
  uploadedAt: string
  category: {
    name: string
    slug: string
  }
}

const AdminVideosPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalVideos, setTotalVideos] = useState(0)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login')
    } else if (isAuthenticated) {
      fetchVideos()
    }
  }, [isAuthenticated, isLoading, router, currentPage, searchTerm, filterStatus])

  const fetchVideos = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 12,
        search: searchTerm,
        status: filterStatus === 'all' ? undefined : filterStatus
      }
      
      const response = await videoAPI.getAdminVideos(params)
      setVideos(response.data.videos)
      setTotalPages(response.data.pagination.totalPages)
      setTotalVideos(response.data.pagination.totalVideos)
    } catch (error) {
      console.error('Error fetching videos:', error)
      toast.error('Failed to load videos')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (videoId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return
    }

    try {
      await videoAPI.delete(videoId)
      toast.success('Video deleted successfully')
      fetchVideos()
    } catch (error: any) {
      console.error('Error deleting video:', error)
      const message = error.response?.data?.error || 'Failed to delete video'
      toast.error(message)
    }
  }

  const handleToggleStatus = async (videoId: string, currentStatus: boolean) => {
    try {
      await videoAPI.update(videoId, { isPublished: !currentStatus })
      toast.success(`Video ${!currentStatus ? 'published' : 'unpublished'} successfully`)
      fetchVideos()
    } catch (error: any) {
      console.error('Error updating video status:', error)
      const message = error.response?.data?.error || 'Failed to update video status'
      toast.error(message)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchVideos()
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-metal-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center text-metal-400 hover:text-primary-500 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-metal-100">Manage Videos</h1>
              <p className="text-metal-400 mt-2">{totalVideos} total videos</p>
            </div>
            <Link
              href="/admin/upload"
              className="btn btn-primary btn-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Upload Video
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-metal-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search videos..."
                  className="input pl-10"
                />
              </div>
            </form>
            <div className="flex items-center space-x-4">
              <Filter className="h-4 w-4 text-metal-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="select"
              >
                <option value="all">All Videos</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* Videos Grid */}
        {loading ? (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12">
            <Video className="h-16 w-16 text-metal-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-metal-300 mb-2">No videos found</h3>
            <p className="text-metal-500 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Start by uploading your first video'}
            </p>
            <Link
              href="/admin/upload"
              className="btn btn-primary btn-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              Upload Video
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video) => (
                <div key={video._id} className="card overflow-hidden">
                  <div className="relative">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        video.isPublished 
                          ? 'bg-nature-600 text-white' 
                          : 'bg-metal-600 text-metal-200'
                      }`}>
                        {video.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-metal-100 mb-2 line-clamp-2">
                      {video.title}
                    </h3>
                    <p className="text-metal-400 text-sm mb-3 line-clamp-2">
                      {video.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-metal-500 mb-4">
                      <span className="bg-metal-800 px-2 py-1 rounded">
                        {video.category.name}
                      </span>
                      <span>{new Date(video.uploadedAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-metal-400 mb-4">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {video.views}
                        </span>
                        <span className="flex items-center">
                          <Heart className="h-3 w-3 mr-1" />
                          {video.likes}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <Link
                          href={`/video/${video._id}`}
                          className="btn btn-outline btn-sm"
                          target="_blank"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(video._id, video.isPublished)}
                          className={`btn btn-sm ${
                            video.isPublished ? 'btn-secondary' : 'btn-primary'
                          }`}
                        >
                          {video.isPublished ? 'Unpublish' : 'Publish'}
                        </button>
                      </div>
                      
                      <div className="flex space-x-1">
                        <button
                          onClick={() => router.push(`/admin/videos/${video._id}/edit`)}
                          className="p-2 text-metal-400 hover:text-primary-500 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(video._id, video.title)}
                          className="p-2 text-metal-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="btn btn-outline btn-sm"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`btn btn-sm ${
                        page === currentPage ? 'btn-primary' : 'btn-outline'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
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
        )}
      </div>
    </div>
  )
}

export default AdminVideosPage
