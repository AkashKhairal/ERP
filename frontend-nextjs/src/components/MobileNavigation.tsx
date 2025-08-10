'use client'

import React, { useState, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Home,
  Users,
  FolderOpen,
  CheckSquare,
  Calendar,
  DollarSign,
  BarChart3,
  FileText,
  Settings,
  Menu,
  X,
  User,
  Bell,
  Search,
  ChevronDown,
  ChevronRight,
  LogOut,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'

interface MobileNavigationProps {
  isOpen: boolean
  onClose: () => void
}

const MobileNavigation = ({ isOpen, onClose }: MobileNavigationProps) => {
  const pathname = usePathname()
  const router = useRouter()
  const { logout, user } = useAuth()
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState<'above' | 'below'>('below')
  const profileButtonRef = useRef<HTMLButtonElement>(null)
  const profileDropdownRef = useRef<HTMLDivElement>(null)

  const navigationSections = [
    {
      id: 'main',
      title: 'Main',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Projects', href: '/projects', icon: FolderOpen },
        { name: 'Tasks', href: '/tasks', icon: CheckSquare },
        { name: 'Calendar', href: '/calendar', icon: Calendar },
      ]
    },
    {
      id: 'management',
      title: 'Management',
      items: [
        { name: 'HR Management', href: '/hr', icon: Users },
        { name: 'Users', href: '/users', icon: Users },
        { name: 'Teams', href: '/teams', icon: Users },
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics',
      items: [
        { name: 'Finance', href: '/finance', icon: DollarSign },
        { name: 'Analytics', href: '/analytics', icon: BarChart3 },
        { name: 'Content', href: '/content', icon: FileText },
      ]
    },
    {
      id: 'settings',
      title: 'Settings',
      items: [
        { name: 'Integrations', href: '/integrations', icon: Settings },
        { name: 'Settings', href: '/settings', icon: Settings },
      ]
    }
  ]

  const handleLogout = () => {
    logout()
    router.push('/')
    onClose()
  }

  const isActive = (href: string) => {
    return pathname === href
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId)
  }

  // Check available space and set dropdown position
  React.useEffect(() => {
    if (profileDropdownOpen && profileButtonRef.current) {
      const buttonRect = profileButtonRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const spaceBelow = viewportHeight - buttonRect.bottom
      const spaceAbove = buttonRect.top
      const dropdownHeight = 400 // Approximate dropdown height
      
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        setDropdownPosition('above')
      } else {
        setDropdownPosition('below')
      }
    }
  }, [profileDropdownOpen])

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-full sm:w-80 bg-card transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">CB</span>
            </div>
            <span className="ml-2 text-lg font-bold">CreatorBase</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-transparent"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex flex-col h-[calc(100%-4rem)] overflow-hidden">
          <div className="flex-1 overflow-y-auto py-2 px-3">
            {navigationSections.map((section) => (
              <div key={section.id} className="mb-4">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md transition-colors"
                >
                  {section.title}
                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${
                      expandedSection === section.id ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                <div
                  className={`mt-1 space-y-1 ${
                    expandedSection === section.id ? 'block' : 'hidden'
                  }`}
                >
                  {section.items.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                          isActive(item.href)
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                        onClick={onClose}
                      >
                        <Icon className="mr-3 h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* User profile section */}
          <div className="border-t border-border p-4">
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                ref={profileButtonRef}
                className="flex items-center space-x-3 w-full text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-3 transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm"
              >
                <div className="flex-shrink-0">
                  {user?.avatar ? (
                    <img
                      className="h-10 w-10 rounded-full ring-2 ring-gray-200 dark:ring-gray-700 shadow-sm"
                      src={user.avatar}
                      alt={user.firstName}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center ring-2 ring-gray-200 dark:ring-gray-700 shadow-sm">
                      <User className="h-6 w-6 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 truncate">{user?.email}</p>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Mobile Profile Dropdown */}
              {profileDropdownOpen && (
                <>
                  {/* Direction Arrow */}
                  <div 
                    className={`absolute left-6 w-0 h-0 border-l-4 border-r-4 border-transparent z-[9998] ${
                      dropdownPosition === 'above' 
                        ? 'bottom-full border-b-4 border-gray-200 dark:border-gray-700' 
                        : 'top-full border-t-4 border-gray-200 dark:border-gray-700'
                    }`}
                  />
                  
                  <div 
                    ref={profileDropdownRef}
                    className={`absolute left-0 right-0 bg-white dark:bg-gray-900 rounded-xl shadow-2xl ring-1 ring-gray-200 dark:ring-gray-700 z-[9999] border border-gray-100 dark:border-gray-800 overflow-hidden ${
                      dropdownPosition === 'above' 
                        ? 'bottom-full mb-2' 
                        : 'top-full mt-2'
                    }`}
                  >
                  {/* Header Section */}
                  <div className="px-4 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        {user?.avatar ? (
                          <img
                            className="h-12 w-12 rounded-full ring-2 ring-white dark:ring-gray-600 shadow-sm"
                            src={user.avatar}
                            alt={user.firstName}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center ring-2 ring-white dark:ring-gray-600 shadow-sm">
                            <User className="h-8 w-8 text-white" />
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-300 truncate">{user?.email}</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                          {user?.position || 'Team Member'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="py-2">
                    <div className="px-2">
                      <Link
                        href="/profile"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onClose();
                        }}
                        className="flex items-center px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors group"
                      >
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                          <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Profile Settings</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Manage your account</p>
                        </div>
                        <ChevronDown className="h-4 w-4 text-gray-400 rotate-[-90deg]" />
                      </Link>

                      <Link
                        href="/settings"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onClose();
                        }}
                        className="flex items-center px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors group"
                      >
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-3 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-colors">
                          <Settings className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Account Settings</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Preferences & security</p>
                        </div>
                        <ChevronDown className="h-4 w-4 text-gray-400 rotate-[-90deg]" />
                      </Link>

                      <Link
                        href="/notifications"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onClose();
                        }}
                        className="flex items-center px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors group"
                      >
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg mr-3 group-hover:bg-orange-200 dark:group-hover:bg-orange-800/50 transition-colors relative">
                          <Bell className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                          <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                            <span className="text-[10px] font-bold">3</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Notifications</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">3 new messages</p>
                        </div>
                        <ChevronDown className="h-4 w-4 text-gray-400 rotate-[-90deg]" />
                      </Link>

                      <Link
                        href="/help"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onClose();
                        }}
                        className="flex items-center px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors group"
                      >
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3 group-hover:bg-green-200 dark:group-hover:bg-green-800/50 transition-colors">
                          <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Help & Support</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Get assistance</p>
                        </div>
                        <ChevronDown className="h-4 w-4 text-gray-400 rotate-[-90deg]" />
                      </Link>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-100 dark:border-gray-700 my-2"></div>

                  {/* Account Actions */}
                  <div className="py-2">
                    <div className="px-2">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="flex w-full items-center px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group"
                      >
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg mr-3 group-hover:bg-red-200 dark:group-hover:bg-red-800/50 transition-colors">
                          <Settings className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium">Settings</p>
                          <p className="text-xs text-red-500 dark:text-red-400">App preferences</p>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="flex w-full items-center px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group"
                      >
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg mr-3 group-hover:bg-red-200 dark:group-hover:bg-red-800/50 transition-colors">
                          <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium">Sign Out</p>
                          <p className="text-xs text-red-500 dark:text-red-400">End your session</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>CreatorBase v1.0</span>
                      <span className="flex items-center">
                        <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                        Online
                      </span>
                    </div>
                  </div>
                </div>
              </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default MobileNavigation