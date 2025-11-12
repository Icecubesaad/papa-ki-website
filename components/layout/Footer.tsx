'use client'

import React from 'react'
import Link from 'next/link'
import { Video, Heart, Mail, Phone, MapPin } from 'lucide-react'

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-metal-950 text-metal-100 border-t border-metal-800">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-gradient-to-r from-primary-600 to-nature-600 rounded-lg shadow-lg">
                <Video className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">Nature is Metal</span>
            </Link>
            <p className="text-metal-400 mb-6 max-w-md">
              Witness the raw power and beauty of nature in its most intense moments. 
              Experience the wild side of our planet through stunning wildlife footage.
            </p>
            
            {/* AdSense Placeholder */}
            <div className="adsense-placeholder h-24 mb-6">
              <span>Advertisement</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-metal-100">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-metal-400 hover:text-primary-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-metal-400 hover:text-primary-400 transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-metal-400 hover:text-primary-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-metal-400 hover:text-primary-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-metal-100">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-metal-400">
                <Mail className="h-4 w-4" />
                <span>info@natureismetal.com</span>
              </li>
              <li className="flex items-center space-x-2 text-metal-400">
                <Phone className="h-4 w-4" />
                <span>+1 (555) NATURE-1</span>
              </li>
              <li className="flex items-center space-x-2 text-metal-400">
                <MapPin className="h-4 w-4" />
                <span>Wild Kingdom Studios</span>
              </li>
            </ul>
          </div>
        </div>

        {/* AdSense Banner */}
        <div className="mt-12 pt-8 border-t border-metal-800">
          <div className="adsense-placeholder h-20 mb-8">
            <span>Advertisement Banner</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-metal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-1 text-metal-400">
              <span>&copy; {currentYear} Nature is Metal. Made with</span>
              <Heart className="h-4 w-4 text-nature-500" />
              <span>for nature enthusiasts.</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link href="/privacy" className="text-metal-400 hover:text-primary-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-metal-400 hover:text-primary-400 transition-colors">
                Terms of Service
              </Link>
              <Link href="/admin/login" className="text-metal-400 hover:text-primary-400 transition-colors">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
