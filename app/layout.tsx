import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Nature is Metal - Witness the Raw Power of Nature',
  description: 'Witness the raw power and beauty of nature in stunning videos',
  keywords: 'nature, wildlife, predators, survival, documentary, nature is metal',
  authors: [{ name: 'Nature is Metal Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'Nature is Metal - Witness the Raw Power of Nature',
    description: 'Witness the raw power and beauty of nature in stunning videos',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nature is Metal - Witness the Raw Power of Nature',
    description: 'Witness the raw power and beauty of nature in stunning videos',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#1f5f1f" />
      </head>
      <body className={`${inter.className} h-full flex flex-col`}>
        <AuthProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(30, 41, 59, 0.95)',
                color: '#f1f5f9',
                border: '1px solid #475569',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                padding: '12px 16px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(8px)',
              },
              success: {
                style: {
                  background: 'rgba(20, 83, 45, 0.95)',
                  border: '1px solid #15803d',
                },
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                style: {
                  background: 'rgba(127, 29, 29, 0.95)',
                  border: '1px solid #dc2626',
                },
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
