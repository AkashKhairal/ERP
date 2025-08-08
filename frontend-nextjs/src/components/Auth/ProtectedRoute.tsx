'use client'

import React, { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const hasRedirected = useRef(false)

  useEffect(() => {
    console.log('ProtectedRoute - isAuthenticated:', isAuthenticated, 'loading:', loading, 'pathname:', pathname)
    
    // Only redirect if we're not loading, not authenticated, haven't redirected yet, and not on login page
    if (!loading && !isAuthenticated && !hasRedirected.current && pathname !== '/login') {
      console.log('ProtectedRoute - redirecting to login')
      hasRedirected.current = true
      router.push('/login')
    }
  }, [isAuthenticated, loading, router, pathname])

  // Reset redirect flag when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      hasRedirected.current = false
    }
  }, [isAuthenticated])

  if (loading) {
    console.log('ProtectedRoute - showing loading spinner')
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute - not authenticated, returning null')
    return null
  }

  console.log('ProtectedRoute - authenticated, rendering children')
  return <>{children}</>
}

export default ProtectedRoute 