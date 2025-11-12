'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Video, 
  Upload, 
  FolderOpen, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User,
  Home,
  Eye
} from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { admin, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Upload Video', href: '/admin/upload', icon: Upload },
    { name: 'Manage Videos', href: '/admin/videos', icon: Video },
    { name: 'Categories', href: '/admin/categories', icon: FolderOpen },
  ]

  const handleLogout = () => {
    logout()
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-metal-950 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-metal-900 border-r border-metal-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-metal-800">
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-r from-primary-600 to-nature-600 rounded-lg">
                <Video className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-bold text-metal-100">Nature is Metal</h1>
                <p className="text-xs text-metal-400">Admin Panel</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-metal-400 hover:text-metal-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-primary-600 text-white' 
                      : 'text-metal-300 hover:text-metal-100 hover:bg-metal-800'
                    }
                  `}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Quick Links */}
          <div className="px-4 py-4 border-t border-metal-800">
            <p className="text-xs font-medium text-metal-400 uppercase tracking-wider mb-3">
              Quick Links
            </p>
            <div className="space-y-2">
              <Link
                href="/"
                target="_blank"
                className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-metal-300 hover:text-metal-100 hover:bg-metal-800 transition-colors"
              >
                <Home className="h-4 w-4 mr-3" />
                View Site
              </Link>
            </div>
          </div>

          {/* User Menu */}
          <div className="p-4 border-t border-metal-800">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-metal-800 rounded-lg">
                <User className="h-4 w-4 text-metal-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-metal-100">{admin?.name}</p>
                <p className="text-xs text-metal-400">{admin?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-metal-900/80 border-b border-metal-800 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-metal-400 hover:text-metal-200"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                target="_blank"
                className="btn btn-outline btn-sm"
              >
                <Eye className="h-3 w-3 mr-2" />
                View Site
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
