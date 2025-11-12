'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react'

interface VideoPlayerProps {
  videoUrl: string
  thumbnailUrl: string
  title: string
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
  autoPlay?: boolean
  className?: string
}

const AdaptiveVideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  thumbnailUrl,
  title,
  dimensions,
  quality,
  autoPlay = false,
  className = ''
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [volume, setVolume] = useState(1)

  // Calculate optimal player dimensions
  const getPlayerDimensions = () => {
    if (!dimensions || !containerRef.current) {
      return { width: '100%', aspectRatio: '16/9' }
    }

    const containerWidth = containerRef.current.offsetWidth
    const { width: videoWidth, height: videoHeight, aspectRatio, orientation } = dimensions

    // For portrait videos, limit max width
    if (orientation === 'portrait') {
      const maxWidth = Math.min(containerWidth * 0.6, 400)
      return {
        width: `${maxWidth}px`,
        aspectRatio: `${videoWidth}/${videoHeight}`
      }
    }

    // For square videos
    if (orientation === 'square') {
      const maxWidth = Math.min(containerWidth * 0.8, 600)
      return {
        width: `${maxWidth}px`,
        aspectRatio: '1/1'
      }
    }

    // For ultrawide videos
    if (aspectRatio === '21:9') {
      return {
        width: '100%',
        aspectRatio: '21/9'
      }
    }

    // Default landscape
    return {
      width: '100%',
      aspectRatio: `${videoWidth}/${videoHeight}` || '16/9'
    }
  }

  const playerDimensions = getPlayerDimensions()

  // Video event handlers
  const togglePlay = () => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    setCurrentTime(videoRef.current.currentTime)
  }

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return
    setDuration(videoRef.current.duration)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return
    
    const time = parseFloat(e.target.value)
    videoRef.current.currentTime = time
    setCurrentTime(time)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return
    
    const newVolume = parseFloat(e.target.value)
    videoRef.current.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      containerRef.current.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout

    const resetTimeout = () => {
      clearTimeout(timeout)
      setShowControls(true)
      timeout = setTimeout(() => {
        if (isPlaying) setShowControls(false)
      }, 3000)
    }

    const handleMouseMove = () => resetTimeout()
    const handleMouseLeave = () => {
      clearTimeout(timeout)
      if (isPlaying) setShowControls(false)
    }

    if (containerRef.current) {
      containerRef.current.addEventListener('mousemove', handleMouseMove)
      containerRef.current.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      clearTimeout(timeout)
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove)
        containerRef.current.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [isPlaying])

  // Fullscreen event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  return (
    <div 
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden mx-auto ${className}`}
      style={{
        width: playerDimensions.width,
        aspectRatio: playerDimensions.aspectRatio
      }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        poster={thumbnailUrl}
        className="w-full h-full object-contain"
        autoPlay={autoPlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlay}
      />

      {/* Quality Badge */}
      {quality && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white text-sm px-3 py-1 rounded">
          {quality.resolution}
          {quality.fps >= 60 && ` ${quality.fps}fps`}
        </div>
      )}

      {/* Controls Overlay */}
      <div 
        className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Play/Pause Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="w-16 h-16 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-200"
          >
            {isPlaying ? (
              <Pause className="h-8 w-8 text-white ml-0" />
            ) : (
              <Play className="h-8 w-8 text-white ml-1" />
            )}
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-white bg-opacity-30 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={togglePlay} className="text-white hover:text-gray-300">
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>
              
              <div className="flex items-center space-x-2">
                <button onClick={toggleMute} className="text-white hover:text-gray-300">
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-white bg-opacity-30 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button className="text-white hover:text-gray-300">
                <Settings className="h-5 w-5" />
              </button>
              <button onClick={toggleFullscreen} className="text-white hover:text-gray-300">
                <Maximize className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdaptiveVideoPlayer
