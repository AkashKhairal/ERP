import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ERP System - Minimal Layout',
  description: 'Minimal layout for testing',
}

export default function MinimalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {/* Minimal header */}
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <h1 className="text-xl font-semibold text-gray-900">ERP System</h1>
                <nav className="flex space-x-4">
                  <a href="/test-basic" className="text-gray-600 hover:text-gray-900">Basic Test</a>
                  <a href="/test-minimal" className="text-gray-600 hover:text-gray-900">Minimal Test</a>
                  <a href="/test-no-icons" className="text-gray-600 hover:text-gray-900">No Icons Test</a>
                </nav>
              </div>
            </div>
          </header>
          
          {/* Main content */}
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
