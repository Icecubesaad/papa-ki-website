'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

interface Admin {
  id: string
  email: string
  name: string
  lastLogin?: string
}

interface AuthContextType {
  admin: Admin | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!admin

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { token, admin: adminData } = response.data

      // Store token in cookie
      Cookies.set('admin_token', token, { expires: 1 }) // 1 day
      
      // Set admin data
      setAdmin(adminData)
      
      toast.success('Login successful!')
      return true
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed'
      toast.error(message)
      return false
    }
  }

  const logout = () => {
    Cookies.remove('admin_token')
    setAdmin(null)
    toast.success('Logged out successfully')
  }

  const checkAuth = async () => {
    const token = Cookies.get('admin_token')
    
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const response = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setAdmin(response.data.admin)
    } catch (error) {
      // Token is invalid, remove it
      Cookies.remove('admin_token')
      setAdmin(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const value: AuthContextType = {
    admin,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
