'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Layout from '@/components/Layout/Layout'
import ProtectedRoute from '@/components/Auth/ProtectedRoute'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

const ConditionalLayout = ({ children }: ConditionalLayoutProps) => {
  const pathname = usePathname()
  
  // Define public routes that don't need authentication or layout
  const publicRoutes = ['/', '/login', '/register']
  
  // Check if current route is public
  const isPublicRoute = publicRoutes.includes(pathname)
  
  if (isPublicRoute) {
    // For public routes, render children directly without ProtectedRoute or Layout
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
