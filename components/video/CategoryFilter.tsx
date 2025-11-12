'use client'

import React from 'react'
import { Grid3X3, Video } from 'lucide-react'

interface Category {
  _id: string
  name: string
  slug: string
  color: string
  icon: string
  videoCount: number
}

interface CategoryFilterProps {
  categories: Category[]
  selectedCategory: string
  onCategoryChange: (categoryId: string) => void
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onCategoryChange('')}
        className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
          selectedCategory === ''
            ? 'bg-white text-black shadow-lg'
            : 'bg-gray-800 text-gray-200 border border-gray-700 hover:bg-gray-700'
        }`}
      >
        <Grid3X3 className="h-4 w-4" />
        <span>All Categories</span>
      </button>
      
      {categories.map((category) => (
        <button
          key={category._id}
          onClick={() => onCategoryChange(category._id)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            selectedCategory === category._id
              ? 'bg-white text-black shadow-lg'
              : 'bg-gray-800 text-gray-200 border border-gray-700 hover:bg-gray-700'
          }`}
        >
          <Video className="h-4 w-4" />
          <span>{category.name}</span>
          <span className="text-xs opacity-75">({category.videoCount})</span>
        </button>
      ))}
    </div>
  )
}

export default CategoryFilter
