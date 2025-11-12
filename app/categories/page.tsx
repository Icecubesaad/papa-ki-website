'use client'

import React, { useState, useEffect } from 'react'
import { categoryAPI } from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { 
  FolderOpen, 
  Video, 
  ArrowRight,
  Search,
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
  thumbnailUrl?: string
}

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await categoryAPI.getAll()
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-metal-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-metal-950">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-900/20 to-nature-900/20 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-metal-100 mb-4">
              Explore Categories
            </h1>
            <p className="text-xl text-metal-300 max-w-3xl mx-auto">
              Discover the raw power and beauty of nature through our curated categories
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and View Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <div className="relative w-full sm:w-96 mb-4 sm:mb-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-metal-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search categories..."
              className="input pl-10"
            />
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

        {/* Categories */}
        {filteredCategories.length === 0 ? (
          <div className="text-center py-16">
            <FolderOpen className="h-16 w-16 text-metal-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-metal-300 mb-2">
              {searchTerm ? 'No categories found' : 'No categories available'}
            </h3>
            <p className="text-metal-500">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Categories will appear here once they are added'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCategories.map((category) => (
              <Link
                key={category._id}
                href={`/categories/${category.slug}`}
                className="card-hover group cursor-pointer"
              >
                <div className="aspect-video bg-gradient-to-br from-primary-900/20 to-nature-900/20 flex items-center justify-center">
                  {category.thumbnailUrl ? (
                    <img
                      src={category.thumbnailUrl}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FolderOpen className="h-16 w-16 text-primary-500" />
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-metal-100 group-hover:text-primary-400 transition-colors">
                      {category.name}
                    </h3>
                    <ArrowRight className="h-4 w-4 text-metal-500 group-hover:text-primary-500 transition-colors" />
                  </div>
                  
                  {category.description && (
                    <p className="text-metal-400 text-sm mb-3 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                  
                  <div className="flex items-center text-sm text-metal-500">
                    <Video className="h-3 w-3 mr-1" />
                    <span>{category.videoCount} videos</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCategories.map((category) => (
              <Link
                key={category._id}
                href={`/categories/${category.slug}`}
                className="card-hover group cursor-pointer"
              >
                <div className="p-6 flex items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-900/20 to-nature-900/20 rounded-lg flex items-center justify-center mr-4">
                    {category.thumbnailUrl ? (
                      <img
                        src={category.thumbnailUrl}
                        alt={category.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <FolderOpen className="h-8 w-8 text-primary-500" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-metal-100 group-hover:text-primary-400 transition-colors">
                        {category.name}
                      </h3>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-sm text-metal-500">
                          <Video className="h-3 w-3 mr-1" />
                          <span>{category.videoCount} videos</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-metal-500 group-hover:text-primary-500 transition-colors" />
                      </div>
                    </div>
                    
                    {category.description && (
                      <p className="text-metal-400 text-sm mt-1">
                        {category.description}
                      </p>
                    )}
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

export default CategoriesPage
