'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Video, 
  Search, 
  Menu, 
  X, 
  Settings, 
  LogOut,
  Home,
  Grid3X3,
  Upload
} from 'lucide-react'

const Header: React.FC = () => {
  const { isAuthenticated, admin, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header className="bg-black shadow-xl border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-white rounded-lg group-hover:bg-gray-200 transition-all duration-200 shadow-lg">
              <Video className="h-6 w-6 text-black" />
            </div>
            <span className="text-xl font-bold text-white hidden sm:block">
              Nature is Metal
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link 
              href="/categories" 
              className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors"
            >
              <Grid3X3 className="h-4 w-4" />
              <span>Categories</span>
            </Link>
            {isAuthenticated && (
              <Link 
                href="/admin" 
                className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>Admin</span>
              </Link>
            )}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search nature videos..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-white focus:border-white transition-colors"
              />
            </div>
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  href="/admin/upload"
                  className="btn btn-primary btn-sm hidden sm:flex"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Upload
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-metal-300 hover:text-primary-400">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-nature-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-sm font-medium">
                        {admin?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden sm:block text-metal-200">{admin?.name}</span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-metal-900/95 backdrop-blur-sm rounded-lg shadow-xl border border-metal-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-1">
                      <Link
                        href="/admin"
                        className="flex items-center px-4 py-2 text-sm text-metal-300 hover:bg-metal-800 hover:text-primary-400 transition-colors"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Admin Panel
                      </Link>
                      <button
                        onClick={logout}
                        className="flex items-center w-full px-4 py-2 text-sm text-metal-300 hover:bg-metal-800 hover:text-red-400 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/admin/login"
                className="btn btn-primary btn-sm"
              >
                Admin Login
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg text-metal-300 hover:bg-metal-800 hover:text-primary-400 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-metal-400" />
            <input
              type="text"
              placeholder="Search nature videos..."
              className="w-full pl-10 pr-4 py-2 bg-metal-800/80 border border-metal-700 rounded-lg text-metal-100 placeholder-metal-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-metal-800 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-metal-900/95 backdrop-blur-sm border-t border-metal-800">
          <div className="px-4 py-2 space-y-1">
            <Link
              href="/"
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-metal-300 hover:bg-metal-800 hover:text-primary-400 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link
              href="/categories"
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-metal-300 hover:bg-metal-800 hover:text-primary-400 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Grid3X3 className="h-4 w-4" />
              <span>Categories</span>
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  href="/admin"
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-metal-300 hover:bg-metal-800 hover:text-primary-400 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  <span>Admin Panel</span>
                </Link>
                <Link
                  href="/admin/upload"
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-metal-300 hover:bg-metal-800 hover:text-primary-400 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload Video</span>
                </Link>
                <button
                  onClick={() => {
                    logout()
                    setIsMobileMenuOpen(false)
                  }}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-metal-300 hover:bg-metal-800 hover:text-red-400 transition-colors w-full text-left"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
