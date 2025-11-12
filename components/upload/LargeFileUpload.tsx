'use client'

import React, { useState, useRef } from 'react'
import { Upload, Video, CheckCircle, AlertCircle, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'

interface LargeFileUploadProps {
  onUploadComplete: (result: any) => void
  onCancel: () => void
  maxSize?: number // in MB
  acceptedTypes?: string[]
}

const LargeFileUpload: React.FC<LargeFileUploadProps> = ({
  onUploadComplete,
  onCancel,
  maxSize = 100,
  acceptedTypes = ['video/mp4', 'video/webm', 'video/avi', 'video/mov']
}) => {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'error'>('idle')
  const [error, setError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const handleFileSelect = (selectedFile: File) => {
    // Validate file size
    if (selectedFile.size > maxSize * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSize}MB`)
      return
    }

    // Validate file type
    if (!acceptedTypes.includes(selectedFile.type)) {
      toast.error('Invalid file type. Please select a video file.')
      return
    }

    setFile(selectedFile)
    setError('')
    setUploadStatus('idle')
    setProgress(0)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }

  const uploadToCloudinary = async () => {
    if (!file) return

    try {
      setUploading(true)
      setUploadStatus('uploading')
      setProgress(0)

      // Get upload signature from backend
      const signatureResponse = await api.post('/upload/signature', {
        resource_type: 'video',
        file_size: file.size
      })

      const {
        signature,
        timestamp,
        api_key,
        cloud_name,
        upload_url,
        folder,
        chunk_size
      } = signatureResponse.data

      // Create form data for Cloudinary
      const formData = new FormData()
      formData.append('file', file)
      formData.append('signature', signature)
      formData.append('timestamp', timestamp.toString())
      formData.append('api_key', api_key)
      formData.append('folder', folder)

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController()

      // Upload directly to Cloudinary with progress tracking
      const xhr = new XMLHttpRequest()
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100)
            setProgress(percentComplete)
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const result = JSON.parse(xhr.responseText)
            setUploadStatus('processing')
            resolve(result)
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        })

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'))
        })

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload cancelled'))
        })

        // Handle abort signal
        abortControllerRef.current?.signal.addEventListener('abort', () => {
          xhr.abort()
        })

        xhr.open('POST', upload_url)
        xhr.send(formData)
      })

    } catch (error: any) {
      console.error('Upload error:', error)
      setError(error.message || 'Upload failed')
      setUploadStatus('error')
      throw error
    }
  }

  const handleUpload = async () => {
    try {
      const cloudinaryResult = await uploadToCloudinary()
      setUploadStatus('completed')
      setProgress(100)
      
      toast.success('Video uploaded successfully!')
      onUploadComplete(cloudinaryResult)
      
    } catch (error: any) {
      if (error.message !== 'Upload cancelled') {
        setError(error.message || 'Upload failed')
        setUploadStatus('error')
        toast.error('Upload failed')
      }
    } finally {
      setUploading(false)
    }
  }

  const handleCancel = () => {
    if (uploading && abortControllerRef.current) {
      abortControllerRef.current.abort()
      setUploading(false)
      setUploadStatus('idle')
      setProgress(0)
      toast('Upload cancelled')
    }
    onCancel()
  }

  const clearFile = () => {
    setFile(null)
    setProgress(0)
    setUploadStatus('idle')
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusColor = () => {
    switch (uploadStatus) {
      case 'uploading': return 'text-blue-400'
      case 'processing': return 'text-yellow-400'
      case 'completed': return 'text-green-400'
      case 'error': return 'text-red-400'
      default: return 'text-metal-400'
    }
  }

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'uploading': return <Upload className="h-5 w-5 animate-pulse" />
      case 'processing': return <Video className="h-5 w-5 animate-pulse" />
      case 'completed': return <CheckCircle className="h-5 w-5" />
      case 'error': return <AlertCircle className="h-5 w-5" />
      default: return <Upload className="h-5 w-5" />
    }
  }

  return (
    <div className="card p-6 border-l-4 border-l-purple-500">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-metal-100 flex items-center">
          <Video className="h-5 w-5 mr-2 text-purple-500" />
          Large File Upload (up to {maxSize}MB)
        </h2>
        <button
          onClick={handleCancel}
          className="text-metal-400 hover:text-metal-300"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="relative border-2 border-dashed border-metal-700 rounded-lg p-8 text-center hover:border-metal-600 transition-colors"
        >
          <Upload className="h-12 w-12 text-metal-500 mx-auto mb-4" />
          <p className="text-metal-300 mb-2">Drop your large video file here or click to browse</p>
          <p className="text-metal-500 text-sm">Supports files up to {maxSize}MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* File Info */}
          <div className="flex items-center justify-between bg-metal-800 p-4 rounded-lg">
            <div className="flex items-center">
              <Video className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-metal-100 font-medium">{file.name}</p>
                <p className="text-metal-400 text-sm">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`flex items-center ${getStatusColor()}`}>
                {getStatusIcon()}
                <span className="ml-2 text-sm capitalize">{uploadStatus}</span>
              </div>
              {!uploading && (
                <button
                  onClick={clearFile}
                  className="text-red-400 hover:text-red-300"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {(uploading || uploadStatus === 'processing') && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-metal-300">
                  {uploadStatus === 'processing' ? 'Processing video...' : 'Uploading...'}
                </span>
                <span className="text-metal-300">{progress}%</span>
              </div>
              <div className="w-full bg-metal-700 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleCancel}
              disabled={uploading}
              className="btn btn-outline btn-sm"
            >
              Cancel
            </button>
            {uploadStatus !== 'completed' && (
              <button
                onClick={handleUpload}
                disabled={uploading || uploadStatus === 'processing'}
                className="btn btn-primary btn-sm"
              >
                {uploading ? 'Uploading...' : 'Start Upload'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default LargeFileUpload
