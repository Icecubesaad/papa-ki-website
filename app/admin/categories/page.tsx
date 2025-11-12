'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { categoryAPI } from '@/lib/api'
import { 
  FolderOpen, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Save,
  X,
  Eye,
  EyeOff,
  Hash
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Category {
  _id: string
  name: string
  slug: string
  description: string
  isActive: boolean
  videoCount: number
  createdAt: string
}

const AdminCategoriesPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login')
    } else if (isAuthenticated) {
      fetchCategories()
    }
  }, [isAuthenticated, isLoading, router])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await categoryAPI.getAdminCategories()
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Category name is required')
      return
    }

    setSubmitting(true)

    try {
      if (editingCategory) {
        await categoryAPI.update(editingCategory._id, formData)
        toast.success('Category updated successfully')
      } else {
        await categoryAPI.create(formData)
        toast.success('Category created successfully')
      }
      
      resetForm()
      fetchCategories()
    } catch (error: any) {
      console.error('Error saving category:', error)
      const message = error.response?.data?.error || 'Failed to save category'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description
    })
    setShowCreateForm(true)
  }

  const handleDelete = async (categoryId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return
    }

    try {
      await categoryAPI.delete(categoryId)
      toast.success('Category deleted successfully')
      fetchCategories()
    } catch (error: any) {
      console.error('Error deleting category:', error)
      const message = error.response?.data?.error || 'Failed to delete category'
      toast.error(message)
    }
  }

  const handleToggleStatus = async (categoryId: string, currentStatus: boolean) => {
    try {
      await categoryAPI.toggle(categoryId)
      toast.success(`Category ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
      fetchCategories()
    } catch (error: any) {
      console.error('Error updating category status:', error)
      const message = error.response?.data?.error || 'Failed to update category status'
      toast.error(message)
    }
  }

  const resetForm = () => {
    setFormData({ name: '', description: '' })
    setEditingCategory(null)
    setShowCreateForm(false)
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <h1 className="text-3xl font-bold text-metal-100">Manage Categories</h1>
              <p className="text-metal-400 mt-2">{categories.length} total categories</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn btn-primary btn-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </button>
          </div>
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="card p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-metal-100">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h2>
              <button
                onClick={resetForm}
                className="text-metal-400 hover:text-metal-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-metal-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="e.g., Wildlife, Predators, Ocean Life"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-metal-300 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Brief description of the category"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-outline btn-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary btn-md"
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingCategory ? 'Update' : 'Create'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Categories List */}
        {loading ? (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="h-16 w-16 text-metal-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-metal-300 mb-2">No categories found</h3>
            <p className="text-metal-500 mb-6">Start by creating your first category</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn btn-primary btn-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div key={category._id} className="card p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold text-metal-100 mr-2">
                        {category.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        category.isActive 
                          ? 'bg-nature-600 text-white' 
                          : 'bg-metal-600 text-metal-200'
                      }`}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-metal-400 mb-2">
                      <Hash className="h-3 w-3 mr-1" />
                      <code className="bg-metal-800 px-2 py-1 rounded text-xs">
                        {category.slug}
                      </code>
                    </div>
                    
                    {category.description && (
                      <p className="text-metal-400 text-sm mb-3">
                        {category.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-metal-500">
                      <span>{category.videoCount} videos</span>
                      <span>{new Date(category.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-metal-800">
                  <button
                    onClick={() => handleToggleStatus(category._id, category.isActive)}
                    className={`btn btn-sm ${
                      category.isActive ? 'btn-secondary' : 'btn-primary'
                    }`}
                  >
                    {category.isActive ? (
                      <>
                        <EyeOff className="h-3 w-3 mr-1" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3 mr-1" />
                        Activate
                      </>
                    )}
                  </button>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 text-metal-400 hover:text-primary-500 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category._id, category.name)}
                      className="p-2 text-metal-400 hover:text-red-500 transition-colors"
                      disabled={category.videoCount > 0}
                      title={category.videoCount > 0 ? 'Cannot delete category with videos' : 'Delete category'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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

export default AdminCategoriesPage
