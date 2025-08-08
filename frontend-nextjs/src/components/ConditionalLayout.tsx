'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Layout from '@/components/Layout/Layout'
import ProtectedRoute from '@/components/Auth/ProtectedRoute'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

const ConditionalLayout = ({ children }: ConditionalLayoutProps) => {
  const pathname = usePathname()
  const [isClient, setIsClient] = useState(false)
  
  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Define public routes that don't need authentication or layout
  const publicRoutes = ['/', '/login', '/register', '/forgot-password']
  
  // Check if current route is public
  const currentPath = pathname || ''
  const isPublicRoute = publicRoutes.includes(currentPath)
  
  // During SSR or before client hydration, render children directly
  if (!isClient) {
    return <>{children}</>
  }
  
  // For public routes, render children directly without ProtectedRoute or Layout
  if (isPublicRoute) {
    return <>{children}</>
  }
  
  // For protected routes, apply ProtectedRoute and Layout
  return (
    <ProtectedRoute>
      <Layout>
        {children}
      </Layout>
    </ProtectedRoute>
  )
}

export default ConditionalLayout
