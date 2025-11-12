'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { videoAPI } from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import AdSenseSlot from '@/components/ads/AdSenseSlot'
import { Eye, Heart, Share2, Calendar, Tag } from 'lucide-react'
import ReactPlayer from 'react-player'
import toast from 'react-hot-toast'

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
}

const VideoPage: React.FC = () => {
  const { id } = useParams()
  const [video, setVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    if (id) {
      fetchVideo(id as string)
    }
  }, [id])

  const fetchVideo = async (videoId: string) => {
    try {
      setLoading(true)
      const response = await videoAPI.getById(videoId)
      setVideo(response.data)
    } catch (error) {
      console.error('Error fetching video:', error)
      toast.error('Failed to load video')
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!video || liked) return
    
    try {
      await videoAPI.like(video._id)
      setVideo(prev => prev ? { ...prev, likes: prev.likes + 1 } : null)
      setLiked(true)
      toast.success('Video liked!')
    } catch (error) {
      console.error('Error liking video:', error)
      toast.error('Failed to like video')
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: video?.title,
          text: video?.description,
          url: window.location.href,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`
    }
    return views.toString()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!video) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-metal-100 mb-2">Video not found</h1>
          <p className="text-metal-400">The video you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-metal-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <div className="bg-black rounded-lg overflow-hidden mb-6">
              <ReactPlayer
                url={video.videoUrl}
                width="100%"
                height="400px"
                controls
                playing={false}
                className="react-player"
              />
            </div>

            {/* Video Info */}
            <div className="bg-metal-900/80 rounded-lg shadow-xl border border-metal-800 p-6 mb-6 backdrop-blur-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-metal-100 mb-2">
                    {video.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-metal-400 mb-4">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{formatViews(video.views)} views</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(video.uploadedAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Tag className="h-4 w-4" />
                      <span className="px-2 py-1 rounded bg-primary-600 text-white text-xs">
                        {video.category.name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-4 mb-6">
                <button
                  onClick={handleLike}
                  disabled={liked}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    liked 
                      ? 'bg-red-900/50 text-red-400 border border-red-700' 
                      : 'bg-metal-800 text-metal-200 hover:bg-metal-700 border border-metal-700'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                  <span>{formatViews(video.likes)} {liked ? 'Liked' : 'Like'}</span>
                </button>
                
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-2 px-4 py-2 bg-metal-800 text-metal-200 rounded-lg hover:bg-metal-700 transition-colors border border-metal-700"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-metal-100 mb-2">Description</h3>
                <p className="text-metal-300 whitespace-pre-wrap">{video.description}</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* AdSense Sidebar */}
            <div className="mb-6">
              <AdSenseSlot 
                slot="sidebar-top"
                format="vertical"
                className="h-64"
              />
            </div>

            {/* Related Videos Placeholder */}
            <div className="bg-metal-900/80 rounded-lg shadow-xl border border-metal-800 p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-metal-100 mb-4">Related Videos</h3>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex space-x-3">
                    <div className="w-24 h-16 bg-metal-800 rounded skeleton"></div>
                    <div className="flex-1">
                      <div className="skeleton-title mb-2"></div>
                      <div className="skeleton-text w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AdSense Sidebar Bottom */}
            <div className="mt-6">
              <AdSenseSlot 
                slot="sidebar-bottom"
                format="vertical"
                className="h-64"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoPage
