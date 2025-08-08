'use client'

import React, { useState } from 'react'
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
  ChevronRight
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
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {user?.avatar ? (
                  <img
                    className="h-9 w-9 rounded-full"
                    src={user.avatar}
                    alt={user.firstName}
                  />
                ) : (
                  <User className="h-9 w-9 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground flex-shrink-0"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default MobileNavigation