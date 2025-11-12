'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { videoAPI, categoryAPI } from '@/lib/api'
import { 
  Video, 
  Upload, 
  Eye, 
  Heart, 
  Users, 
  TrendingUp,
  Plus,
  Settings
} from 'lucide-react'
import Link from 'next/link'

const AdminDashboard: React.FC = () => {
  const { admin } = useAuth()
  const [stats, setStats] = useState({
    totalVideos: 0,
    totalViews: 0,
    totalLikes: 0,
    totalCategories: 0
  })
  const [recentVideos, setRecentVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [videosResponse, categoriesResponse] = await Promise.all([
        videoAPI.getAdminVideos({ limit: 5 }),
        categoryAPI.getAdminCategories()
      ])

      const videos = videosResponse.data.videos
      const categories = categoriesResponse.data

      // Calculate stats
      const totalViews = videos.reduce((sum: number, video: any) => sum + video.views, 0)
      const totalLikes = videos.reduce((sum: number, video: any) => sum + video.likes, 0)

      setStats({
        totalVideos: videosResponse.data.pagination.totalVideos,
        totalViews,
        totalLikes,
        totalCategories: categories.length
      })

      setRecentVideos(videos)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-metal-100">Admin Dashboard</h1>
        <p className="text-metal-400 mt-2">Welcome back, {admin?.name}!</p>
      </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            href="/admin/upload"
            className="bg-gradient-to-r from-primary-600 to-nature-600 text-white p-6 rounded-lg hover:from-primary-700 hover:to-nature-700 transition-all duration-200 shadow-lg"
          >
            <div className="flex items-center">
              <Upload className="h-8 w-8 mr-3" />
              <div>
                <h3 className="text-lg font-semibold">Upload Video</h3>
                <p className="text-white/80">Add new content</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/videos"
            className="bg-metal-900/80 border border-metal-700 p-6 rounded-lg hover:bg-metal-800 transition-colors backdrop-blur-sm"
          >
            <div className="flex items-center">
              <Video className="h-8 w-8 mr-3 text-metal-400" />
              <div>
                <h3 className="text-lg font-semibold text-metal-100">Manage Videos</h3>
                <p className="text-metal-400">Edit and organize</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/categories"
            className="bg-metal-900/80 border border-metal-700 p-6 rounded-lg hover:bg-metal-800 transition-colors backdrop-blur-sm"
          >
            <div className="flex items-center">
              <Settings className="h-8 w-8 mr-3 text-metal-400" />
              <div>
                <h3 className="text-lg font-semibold text-metal-100">Categories</h3>
                <p className="text-metal-400">Manage categories</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-metal-900/80 p-6 rounded-lg shadow-xl border border-metal-800 backdrop-blur-sm">
            <div className="flex items-center">
              <Video className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <p className="text-sm text-metal-400">Total Videos</p>
                <p className="text-2xl font-bold text-metal-100">{stats.totalVideos}</p>
              </div>
            </div>
          </div>

          <div className="bg-metal-900/80 p-6 rounded-lg shadow-xl border border-metal-800 backdrop-blur-sm">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-metal-400">Total Views</p>
                <p className="text-2xl font-bold text-metal-100">{stats.totalViews.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-metal-900/80 p-6 rounded-lg shadow-xl border border-metal-800 backdrop-blur-sm">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm text-metal-400">Total Likes</p>
                <p className="text-2xl font-bold text-metal-100">{stats.totalLikes.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-metal-900/80 p-6 rounded-lg shadow-xl border border-metal-800 backdrop-blur-sm">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-metal-400">Categories</p>
                <p className="text-2xl font-bold text-metal-100">{stats.totalCategories}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Videos */}
        <div className="bg-metal-900/80 rounded-lg shadow-xl border border-metal-800 backdrop-blur-sm">
          <div className="p-6 border-b border-metal-800">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-metal-100">Recent Videos</h2>
              <Link
                href="/admin/videos"
                className="text-primary-400 hover:text-primary-300 text-sm font-medium"
              >
                View all
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <LoadingSpinner size="md" />
            </div>
          ) : recentVideos.length === 0 ? (
            <div className="p-8 text-center">
              <Video className="h-12 w-12 text-metal-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-metal-100 mb-2">No videos yet</h3>
              <p className="text-metal-400 mb-4">Start by uploading your first video</p>
              <Link
                href="/admin/upload"
                className="btn btn-primary btn-md"
              >
                <Plus className="h-4 w-4 mr-2" />
                Upload Video
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-metal-800">
              {recentVideos.map((video: any) => (
                <div key={video._id} className="p-6 hover:bg-metal-800/50">
                  <div className="flex items-center space-x-4">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-20 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-metal-100 truncate">
                        {video.title}
                      </h3>
                      <p className="text-sm text-metal-400 truncate">
                        {video.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-metal-500">
                        <span className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {video.views}
                        </span>
                        <span className="flex items-center">
                          <Heart className="h-3 w-3 mr-1" />
                          {video.likes}
                        </span>
                        <span>{new Date(video.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  )
}

export default AdminDashboard
