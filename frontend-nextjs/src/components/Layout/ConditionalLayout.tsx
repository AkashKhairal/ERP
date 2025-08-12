'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import LuxurySidebar from './LuxurySidebar'
import { usePathname } from 'next/navigation'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

const ConditionalLayout = ({ children }: ConditionalLayoutProps) => {
  const { user, isAuthenticated } = useAuth()
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Check if current page should show sidebar
  const shouldShowSidebar = () => {
    // Don't show sidebar on landing page or auth pages
    if (pathname === '/' || pathname.startsWith('/auth') || pathname.startsWith('/login')) {
      return false
    }
    
    // Show sidebar only if user is authenticated
    return isAuthenticated && user
  }

  useEffect(() => {
    // Ensure we're on the client side
    setMounted(true)
    
    // Check if we're on mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [pathname, isAuthenticated, user])

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    )
  }

  // If we shouldn't show sidebar, render without it
  if (!shouldShowSidebar()) {
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    )
  }

  // Show sidebar for authenticated users on app pages
  return (
    <div className="flex h-screen bg-gray-100">
      <LuxurySidebar 
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        isMobile={isMobile}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  )
}

export default ConditionalLayout
