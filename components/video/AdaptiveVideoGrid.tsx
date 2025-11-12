'use client'

import React, { useMemo } from 'react'
import OptimizedVideoCard from './OptimizedVideoCard'

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

interface AdaptiveVideoGridProps {
  videos: Video[]
  className?: string
}

const AdaptiveVideoGrid: React.FC<AdaptiveVideoGridProps> = ({ videos, className = '' }) => {
  // Analyze video orientations to optimize grid layout
  const gridAnalysis = useMemo(() => {
    const orientationCounts = videos.reduce((acc, video) => {
      const orientation = video.dimensions?.orientation || 'landscape'
      acc[orientation] = (acc[orientation] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const total = videos.length
    const portraitRatio = (orientationCounts.portrait || 0) / total
    const squareRatio = (orientationCounts.square || 0) / total
    const landscapeRatio = (orientationCounts.landscape || 0) / total

    return {
      orientationCounts,
      portraitRatio,
      squareRatio,
      landscapeRatio,
      dominantOrientation: Object.entries(orientationCounts).reduce((a, b) => 
        orientationCounts[a[0]] > orientationCounts[b[0]] ? a : b
      )?.[0] || 'landscape'
    }
  }, [videos])

  // Determine optimal grid layout based on content
  const getGridClasses = () => {
    const { portraitRatio, squareRatio, dominantOrientation } = gridAnalysis

    // If mostly portrait videos (mobile content)
    if (portraitRatio > 0.6) {
      return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3'
    }

    // If mostly square videos (social media content)
    if (squareRatio > 0.5) {
      return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'
    }

    // Mixed content - use masonry-like approach
    if (portraitRatio > 0.2 && squareRatio > 0.2) {
      return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 auto-rows-max'
    }

    // Default landscape layout (YouTube-like)
    return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
  }

  // Group videos for optimal layout
  const organizedVideos = useMemo(() => {
    const { dominantOrientation } = gridAnalysis
    
    // If mixed orientations, group similar ones together
    if (gridAnalysis.portraitRatio > 0.2 && gridAnalysis.landscapeRatio > 0.2) {
      const landscape = videos.filter(v => v.dimensions?.orientation === 'landscape' || !v.dimensions)
      const portrait = videos.filter(v => v.dimensions?.orientation === 'portrait')
      const square = videos.filter(v => v.dimensions?.orientation === 'square')
      
      // Interleave for better visual balance
      const organized = []
      const maxLength = Math.max(landscape.length, portrait.length, square.length)
      
      for (let i = 0; i < maxLength; i++) {
        if (landscape[i]) organized.push(landscape[i])
        if (portrait[i]) organized.push(portrait[i])
        if (square[i]) organized.push(square[i])
      }
      
      return organized
    }
    
    return videos
  }, [videos, gridAnalysis])

  return (
    <div className={`${getGridClasses()} ${className}`}>
      {organizedVideos.map((video, index) => (
        <div 
          key={video._id}
          className={`
            ${video.dimensions?.orientation === 'portrait' ? 'row-span-1' : ''}
            ${video.dimensions?.orientation === 'square' ? 'aspect-square' : ''}
          `}
        >
          <OptimizedVideoCard 
            video={video} 
            index={index}
            priority={index < 8} // Prioritize first 8 videos
          />
        </div>
      ))}
    </div>
  )
}

export default AdaptiveVideoGrid
