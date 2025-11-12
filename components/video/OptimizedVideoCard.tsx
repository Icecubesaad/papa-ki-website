'use client'

import React, { useState, memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Play, Eye, Heart, Clock } from 'lucide-react'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'

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

interface OptimizedVideoCardProps {
  video: Video
  priority?: boolean
  index?: number
}

const OptimizedVideoCard = memo<OptimizedVideoCardProps>(({ video, priority = false, index = 0 }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const { elementRef, hasIntersected } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px'
  })

  // Determine card layout based on video dimensions
  const getCardLayout = () => {
    if (!video.dimensions) return 'aspect-video' // Default 16:9
    
    const { aspectRatio, orientation } = video.dimensions
    
    switch (orientation) {
      case 'portrait':
        return 'aspect-[9/16]' // Vertical videos
      case 'square':
        return 'aspect-square'
      default:
        // Handle different landscape ratios
        if (aspectRatio === '21:9') return 'aspect-[21/9]'
        if (aspectRatio === '4:3') return 'aspect-[4/3]'
        return 'aspect-video' // Default 16:9
    }
  }

  const getQualityBadge = () => {
    if (!video.quality) return null
    
    const { resolution, fps } = video.quality
    const isHighFPS = fps >= 60
    const isHighRes = ['1080p', '1440p', '4K'].includes(resolution)
    
    if (isHighRes || isHighFPS) {
      return (
        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded font-semibold">
          {resolution}{isHighFPS ? ` ${fps}fps` : ''}
        </div>
      )
    }
    return null
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
    return views.toString()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  return (
    <div 
      ref={elementRef}
      className="video-card group animate-fade-in"
      style={{
        animationDelay: `${index * 50}ms`,
        animationFillMode: 'both'
      }}
    >
      <Link href={`/video/${video._id}`}>
        <div className="relative">
          {/* Thumbnail Container with Dynamic Aspect Ratio */}
          <div className={`relative ${getCardLayout()} bg-gray-800 rounded-lg overflow-hidden`}>
            {/* Loading Skeleton */}
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-gray-800 animate-pulse" />
            )}
            
            {/* Image - Only load when in viewport or priority */}
            {(hasIntersected || priority) && !imageError && (
              <Image
                src={video.thumbnailUrl}
                alt={video.title}
                fill
                className={`video-thumbnail transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                loading={priority ? 'eager' : 'lazy'}
                priority={priority}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              />
            )}
            
            {/* Error State */}
            {imageError && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <Play className="h-8 w-8 text-gray-600" />
              </div>
            )}
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
              <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg">
                <Play className="h-5 w-5 text-black ml-0.5" />
              </div>
            </div>
            
            {/* Quality Badge */}
            {getQualityBadge()}
            
            {/* Duration Badge */}
            {video.duration > 0 && (
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                {formatDuration(video.duration)}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Category Badge */}
            <div className="mb-2">
              <span className="category-badge bg-white text-black">
                {video.category.name}
              </span>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-gray-300 transition-colors">
              {video.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-400 mb-3 line-clamp-2">
              {video.description}
            </p>

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Eye className="h-3 w-3" />
                  <span>{formatViews(video.views)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="h-3 w-3" />
                  <span>{formatViews(video.likes)}</span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{formatDate(video.uploadedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
})

OptimizedVideoCard.displayName = 'OptimizedVideoCard'

export default OptimizedVideoCard
