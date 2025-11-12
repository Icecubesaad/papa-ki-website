import axios from 'axios'
import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      Cookies.remove('admin_token')
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(error)
  }
)

// API endpoints
export const videoAPI = {
  getAll: (params?: any) => api.get('/videos', { params }),
  getTrending: (limit?: number) => api.get('/videos/trending', { params: { limit } }),
  getRecommendations: (id: string, limit?: number) => api.get(`/videos/${id}/recommendations`, { params: { limit } }),
  getById: (id: string) => api.get(`/videos/${id}`),
  create: (formData: FormData) => api.post('/videos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300000, // 5 minutes for video upload
  }),
  update: (id: string, data: any) => api.put(`/videos/${id}`, data),
  delete: (id: string) => api.delete(`/videos/${id}`),
  like: (id: string) => api.post(`/videos/${id}/like`),
  getAdminVideos: (params?: any) => api.get('/videos/admin/all', { params }),
}

export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getBySlug: (slug: string) => api.get(`/categories/${slug}`),
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
  getAdminCategories: () => api.get('/categories/admin/all'),
  toggle: (id: string) => api.patch(`/categories/${id}/toggle`),
}

export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
  verify: () => api.post('/auth/verify'),
  setup: (data: any) => api.post('/auth/setup', data),
}

export default api
