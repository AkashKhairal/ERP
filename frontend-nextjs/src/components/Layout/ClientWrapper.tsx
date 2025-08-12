'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { ThemeProvider } from '@/context/ThemeContext'
import { AuthProvider } from '@/context/AuthContext'
import LuxurySidebar from './LuxurySidebar'

interface ClientWrapperProps {
  children: React.ReactNode
}

const ClientWrapper = ({ children }: ClientWrapperProps) => {
  const pathname = usePathname()
  
  // Don't show sidebar on landing page and auth pages
  const isPublicPage = pathname === '/' || pathname?.startsWith('/auth') || pathname === '/login' || pathname === '/register'
  
  if (isPublicPage) {
    return (
      <ThemeProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    )
  }
  
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="flex h-screen bg-gray-100">
          <LuxurySidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
              {children}
            </main>
          </div>
        </div>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default ClientWrapper
