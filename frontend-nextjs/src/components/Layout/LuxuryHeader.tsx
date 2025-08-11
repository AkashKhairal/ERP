'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Search, 
  Bell, 
  Settings, 
  Menu,
  Plus,
  Filter,
  Download,
  MoreHorizontal
} from 'lucide-react'
import SearchBar from '@/components/SearchBar'
import NotificationDropdown from '@/components/NotificationDropdown'

interface LuxuryHeaderProps {
  onMenuClick: () => void
  isCollapsed: boolean
}

const LuxuryHeader = ({ onMenuClick, isCollapsed }: LuxuryHeaderProps) => {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden rounded-full p-2 hover:bg-white/60"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </Button>

          {/* Breadcrumb or page title could go here */}
          <div className="hidden sm:block">
            <nav className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="font-medium text-gray-900">Dashboard</span>
            </nav>
          </div>
        </div>

        {/* Center section - Search */}
        <div className="flex-1 max-w-2xl mx-4">
          <div className="relative">
            <SearchBar />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-2">
          {/* Quick action buttons */}
          <div className="hidden md:flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full p-2 hover:bg-white/60 transition-all duration-200"
            >
              <Download className="h-4 w-4 text-gray-600" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full p-2 hover:bg-white/60 transition-all duration-200"
            >
              <Filter className="h-4 w-4 text-gray-600" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full p-2 hover:bg-white/60 transition-all duration-200"
            >
              <MoreHorizontal className="h-4 w-4 text-gray-600" />
            </Button>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-200/50 mx-2" />

          {/* Notifications */}
          <NotificationDropdown />

          {/* Add new button */}
          <Button className="rounded-xl bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-2 font-medium shadow-sm hover:shadow-md transition-all duration-200 ease-out">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Add New</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

export default LuxuryHeader
