'use client'

import React, { useState, useEffect } from 'react'
import LuxurySidebar from './LuxurySidebar'
import LuxuryHeader from './LuxuryHeader'

interface LuxuryLayoutProps {
  children: React.ReactNode
}

const LuxuryLayout = ({ children }: LuxuryLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      // Auto-collapse on mobile
      if (mobile) {
        setSidebarCollapsed(true)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fafafa] via-[#fdfdfd] to-[#f5f5f5]">
      {/* Sidebar */}
      <LuxurySidebar 
        isCollapsed={sidebarCollapsed} 
        onToggleCollapse={handleSidebarToggle}
      />

      {/* Main content area */}
      <div className={`
        flex flex-col min-h-screen transition-all duration-300 ease-out
        ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-80'}
      `}>
        {/* Header */}
        <LuxuryHeader 
          onMenuClick={handleSidebarToggle}
          isCollapsed={sidebarCollapsed}
        />

        {/* Page content */}
        <main className="flex-1">
          <div className="relative">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default LuxuryLayout
