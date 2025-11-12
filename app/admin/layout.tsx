'use client'

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface AdminLayoutWrapperProps {
  children: React.ReactNode
}

const AdminLayoutWrapper: React.FC<AdminLayoutWrapperProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Don't apply layout to login page
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-metal-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    router.push('/admin/login')
    return null
  }

  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  )
}

export default AdminLayoutWrapper
