'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isClient, setIsClient] = useState(false)
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const hasRedirected = useRef(false)

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return
    
    console.log('ProtectedRoute - isAuthenticated:', isAuthenticated, 'loading:', loading, 'pathname:', pathname)
    
    // Only redirect if we're not loading, not authenticated, haven't redirected yet, and not on login page
    if (!loading && !isAuthenticated && !hasRedirected.current && pathname !== '/login') {
      console.log('ProtectedRoute - redirecting to login')
      hasRedirected.current = true
      router.push('/login')
    }
  }, [isAuthenticated, loading, router, pathname, isClient])

  // Reset redirect flag when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      hasRedirected.current = false
    }
  }, [isAuthenticated])

  // Show loading spinner during SSR or while checking authentication
  if (!isClient || loading) {
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