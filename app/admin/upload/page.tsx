'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { videoAPI, categoryAPI } from '@/lib/api'
import { 
  Upload, 
  Video, 
  Image as ImageIcon, 
  X, 
  ArrowLeft,
  Save,
  Eye
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Category {
  _id: string
  name: string
  slug: string
}

const AdminUploadPage: React.FC = () => {
  const { } = useAuth()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    tags: '',
    isPublished: true
  })
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string>('')
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('')

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAdminCategories()
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to load categories')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 500 * 1024 * 1024) { // 500MB limit
        toast.error('Video file size must be less than 500MB')
        return
      }
      setVideoFile(file)
      const url = URL.createObjectURL(file)
      setVideoPreview(url)
    }
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('Thumbnail file size must be less than 10MB')
        return
      }
      setThumbnailFile(file)
      const url = URL.createObjectURL(file)
      setThumbnailPreview(url)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!videoFile) {
      toast.error('Please select a video file')
      return
    }

    if (!formData.title.trim()) {
      toast.error('Please enter a title')
      return
    }

    if (!formData.categoryId) {
      toast.error('Please select a category')
      return
    }

    setUploading(true)

    try {
      const uploadData = new FormData()
      uploadData.append('title', formData.title)
      uploadData.append('description', formData.description)
      uploadData.append('categoryId', formData.categoryId)
      uploadData.append('tags', formData.tags)
      uploadData.append('isPublished', formData.isPublished.toString())
      uploadData.append('video', videoFile)
      
      if (thumbnailFile) {
        uploadData.append('thumbnail', thumbnailFile)
      }

      await videoAPI.create(uploadData)
      
      toast.success('Video uploaded successfully!')
      router.push('/admin/videos')
    } catch (error: any) {
      console.error('Upload error:', error)
      const message = error.response?.data?.error || 'Failed to upload video'
      toast.error(message)
    } finally {
      setUploading(false)
    }
  }

  const clearVideo = () => {
    setVideoFile(null)
    setVideoPreview('')
  }

  const clearThumbnail = () => {
    setThumbnailFile(null)
    setThumbnailPreview('')
  }


  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center text-metal-400 hover:text-primary-500 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-metal-100">Upload Video</h1>
          <p className="text-metal-400 mt-2">Add new content to nature goes metal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Video Upload */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-metal-100 mb-4 flex items-center">
              <Video className="h-5 w-5 mr-2" />
              Video File
            </h2>
            
            {!videoFile ? (
              <div className="border-2 border-dashed border-metal-700 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-metal-500 mx-auto mb-4" />
                <p className="text-metal-300 mb-2">Click to upload or drag and drop</p>
                <p className="text-metal-500 text-sm">MP4, WebM or AVI (max 500MB)</p>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-metal-800 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Video className="h-8 w-8 text-primary-500 mr-3" />
                    <div>
                      <p className="text-metal-100 font-medium">{videoFile.name}</p>
                      <p className="text-metal-400 text-sm">
                        {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearVideo}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                {videoPreview && (
                  <video
                    src={videoPreview}
                    controls
                    className="w-full max-w-md rounded-lg"
                  />
                )}
              </div>
            )}
          </div>

          {/* Thumbnail Upload */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-metal-100 mb-4 flex items-center">
              <ImageIcon className="h-5 w-5 mr-2" />
              Thumbnail (Optional)
            </h2>
            
            {!thumbnailFile ? (
              <div className="border-2 border-dashed border-metal-700 rounded-lg p-8 text-center">
                <ImageIcon className="h-12 w-12 text-metal-500 mx-auto mb-4" />
                <p className="text-metal-300 mb-2">Upload custom thumbnail</p>
                <p className="text-metal-500 text-sm">JPG, PNG or WebP (max 10MB)</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-metal-800 p-4 rounded-lg">
                  <div className="flex items-center">
                    <ImageIcon className="h-8 w-8 text-primary-500 mr-3" />
                    <div>
                      <p className="text-metal-100 font-medium">{thumbnailFile.name}</p>
                      <p className="text-metal-400 text-sm">
                        {(thumbnailFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearThumbnail}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                {thumbnailPreview && (
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-full max-w-sm rounded-lg"
                  />
                )}
              </div>
            )}
          </div>

          {/* Video Details */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-metal-100 mb-4">Video Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-metal-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Enter video title"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-metal-300 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="textarea"
                  placeholder="Enter video description"
                />
              </div>

              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-metal-300 mb-2">
                  Category *
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="select"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-metal-300 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="nature, wildlife, predator (comma separated)"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={handleInputChange}
                    className="rounded border-metal-700 bg-metal-900 text-primary-600 focus:ring-primary-500 focus:ring-offset-metal-950"
                  />
                  <span className="ml-2 text-metal-300">Publish immediately</span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/admin"
              className="btn btn-outline btn-lg"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={uploading || !videoFile}
              className="btn btn-primary btn-lg"
            >
              {uploading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Upload Video
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminUploadPage
