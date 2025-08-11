'use client'

import React, { useState, useEffect, useRef } from 'react'
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
  LogOut,
  Menu,
  X,
  User,
  Bell,
  Search,
  ChevronDown,
  UserCircle,
  Shield,
  HelpCircle,
  Mail,
  Key,
  Lock,
  CreditCard,
  BookOpen,
  MessageSquare,
  Zap,
  Globe,
  Database,
  Monitor,
  Palette,
  Moon,
  Sun,
  Smartphone,
  Globe2,
  ShieldCheck,
  Activity,
  TrendingUp,
  PieChart,
  BarChart,
  CalendarDays,
  Clock,
  Target,
  Award,
  Star,
  Heart,
  Gift,
  Cog,
  Wrench,
  Info,
  ExternalLink,
  Building2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useAuth } from '@/context/AuthContext'
import SearchBar from '@/components/SearchBar'
import MobileNavigation from '@/components/MobileNavigation'
import NotificationDropdown from '@/components/NotificationDropdown'

interface LayoutProps {
  children: React.ReactNode
}

interface SubMenuItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  badge?: string
  badgeColor?: string
  external?: boolean
}

interface MenuItem {
  name: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  subItems: SubMenuItem[]
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null)
  const { logout, user } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const profileDropdownRef = useRef<HTMLDivElement>(null)
  const profileButtonRef = useRef<HTMLButtonElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState<'above' | 'below'>('below')

  // Enhanced menu structure with sub-menus
  const profileMenuItems: MenuItem[] = [
    {
      name: 'Account',
      icon: User,
      description: 'Manage your account settings',
      subItems: [
        {
          name: 'Profile Settings',
          href: '/profile',
          icon: User,
          description: 'Edit your personal information',
          badge: 'Updated',
          badgeColor: 'bg-green-100 text-green-800'
        },
        {
          name: 'Account Security',
          href: '/security',
          icon: Lock,
          description: 'Password, 2FA, and security settings',
          badge: 'Secure',
          badgeColor: 'bg-blue-100 text-blue-800'
        },
        {
          name: 'Billing & Plans',
          href: '/billing',
          icon: CreditCard,
          description: 'Manage subscriptions and payments',
          badge: 'Pro',
          badgeColor: 'bg-purple-100 text-purple-800'
        },
        {
          name: 'Preferences',
          href: '/preferences',
          icon: Cog,
          description: 'Theme, notifications, and language'
        }
      ]
    },
    {
      name: 'Workspace',
      icon: Building2,
      description: 'Team and project management',
      subItems: [
        {
          name: 'Team Settings',
          href: '/teams/settings',
          icon: Users,
          description: 'Manage team members and roles'
        },
        {
          name: 'Project Overview',
          href: '/projects/overview',
          icon: FolderOpen,
          description: 'View all your projects'
        },
        {
          name: 'Task Management',
          href: '/tasks/dashboard',
          icon: CheckSquare,
          description: 'Organize and track tasks'
        },
        {
          name: 'Sprint Planning',
          href: '/sprints/planning',
          icon: Calendar,
          description: 'Plan and manage sprints'
        }
      ]
    },
    {
      name: 'Analytics',
      icon: BarChart3,
      description: 'Data insights and reporting',
      subItems: [
        {
          name: 'Performance Dashboard',
          href: '/analytics/performance',
          icon: TrendingUp,
          description: 'Track your key metrics'
        },
        {
          name: 'Team Analytics',
          href: '/analytics/team',
          icon: Users,
          description: 'Team performance insights'
        },
        {
          name: 'Project Reports',
          href: '/analytics/projects',
          icon: PieChart,
          description: 'Detailed project analysis'
        },
        {
          name: 'Custom Reports',
          href: '/analytics/custom',
          icon: BarChart,
          description: 'Create custom reports'
        }
      ]
    },
    {
      name: 'Integrations',
      icon: Zap,
      description: 'Connect with external tools',
      subItems: [
        {
          name: 'GitHub',
          href: '/integrations/github',
          icon: ExternalLink,
          description: 'Connect your GitHub repositories',
          badge: 'Connected',
          badgeColor: 'bg-green-100 text-green-800'
        },
        {
          name: 'Slack',
          href: '/integrations/slack',
          icon: MessageSquare,
          description: 'Get notifications in Slack'
        },
        {
          name: 'Google Workspace',
          href: '/integrations/google',
          icon: Globe,
          description: 'Sync with Google Calendar & Drive'
        },
        {
          name: 'API Keys',
          href: '/integrations/api',
          icon: Key,
          description: 'Manage API integrations'
        }
      ]
    },
    {
      name: 'Support',
      icon: HelpCircle,
      description: 'Get help and resources',
      subItems: [
        {
          name: 'Help Center',
          href: '/help',
          icon: BookOpen,
          description: 'Documentation and guides'
        },
        {
          name: 'Contact Support',
          href: '/support',
          icon: MessageSquare,
          description: 'Get help from our team'
        },
        {
          name: 'Community',
          href: '/community',
          icon: Users,
          description: 'Connect with other users'
        },
        {
          name: 'Feature Requests',
          href: '/feedback',
          icon: Heart,
          description: 'Suggest new features'
        }
      ]
    }
  ]

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false)
        setActiveSubMenu(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Check available space and set dropdown position
  useEffect(() => {
    if (profileDropdownOpen && profileButtonRef.current) {
      const buttonRect = profileButtonRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const spaceBelow = viewportHeight - buttonRect.bottom
      const spaceAbove = buttonRect.top
      const dropdownHeight = 600 // Approximate dropdown height
      
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        setDropdownPosition('above')
      } else {
        setDropdownPosition('below')
      }
    }
  }, [profileDropdownOpen])

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd/Ctrl + K to focus search
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        // The search bar will handle its own focus
      }
      
      // Escape to close dropdown
      if (event.key === 'Escape' && profileDropdownOpen) {
        setProfileDropdownOpen(false)
        setActiveSubMenu(null)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [profileDropdownOpen])

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'HR Management', href: '/hr', icon: Users },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Teams', href: '/teams', icon: Users },
    { name: 'Projects', href: '/projects', icon: FolderOpen },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Sprints', href: '/sprints', icon: Calendar },
    { name: 'Finance', href: '/finance', icon: DollarSign },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Content', href: '/content', icon: FileText },
    { name: 'Integrations', href: '/integrations', icon: Settings },
    { name: 'Roles & Permissions', href: '/roles-permissions', icon: Key },
  ]

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const isActive = (href: string) => {
    return pathname === href
  }

  const toggleSubMenu = (menuName: string) => {
    if (activeSubMenu === menuName) {
      setActiveSubMenu(null)
    } else {
      setActiveSubMenu(menuName)
    }
  }

  const handleMenuItemClick = (href: string) => {
    setProfileDropdownOpen(false)
    setActiveSubMenu(null)
    router.push(href)
  }

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Mobile Navigation */}
      <MobileNavigation isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-50 lg:bg-card lg:border-r lg:border-border">
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-bold">CreatorBase</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="mr-3 h-4 w-4 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* User profile section - Fixed at bottom */}
        <div className="border-t border-border p-4 flex-shrink-0">
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
                    <UserCircle className="h-6 w-6 text-white" />
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

            {/* Enhanced Profile Dropdown with Sub-menus */}
            {profileDropdownOpen && (
              <div 
                ref={profileDropdownRef}
                className={`absolute left-0 right-0 bg-white dark:bg-gray-900 rounded-xl shadow-2xl ring-1 ring-gray-200 dark:ring-gray-700 z-50 border border-gray-100 dark:border-gray-800 overflow-hidden ${
                  dropdownPosition === 'above' ? 'bottom-full mb-2' : 'top-full mt-2'
                }`}
                style={{ minWidth: '320px', maxHeight: '600px' }}
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
                          <UserCircle className="h-8 w-8 text-white" />
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

                {/* Menu Items with Sub-menus */}
                <div className="py-2 max-h-96 overflow-y-auto">
                  {profileMenuItems.map((menuItem) => (
                    <div key={menuItem.name} className="px-2">
                      {/* Main Menu Item */}
                      <button
                        onClick={() => toggleSubMenu(menuItem.name)}
                        className="flex items-center w-full px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors group"
                      >
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg mr-3 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                          <menuItem.icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium">{menuItem.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{menuItem.description}</p>
                        </div>
                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                          activeSubMenu === menuItem.name ? 'rotate-180' : ''
                        }`} />
                      </button>

                      {/* Sub-menu Items */}
                      {activeSubMenu === menuItem.name && (
                        <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                          {menuItem.subItems.map((subItem) => (
                            <button
                              key={subItem.name}
                              onClick={() => handleMenuItemClick(subItem.href)}
                              className="flex items-center w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors group"
                            >
                              <div className="p-1.5 bg-gray-50 dark:bg-gray-800 rounded-md mr-3 group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors">
                                <subItem.icon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                              </div>
                              <div className="flex-1 text-left">
                                <div className="flex items-center space-x-2">
                                  <p className="font-medium">{subItem.name}</p>
                                  {subItem.badge && (
                                    <Badge className={`text-xs ${subItem.badgeColor}`}>
                                      {subItem.badge}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{subItem.description}</p>
                              </div>
                              {subItem.external && (
                                <ExternalLink className="h-3 w-3 text-gray-400 ml-2" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 dark:border-gray-700 my-2"></div>

                {/* Quick Actions */}
                <div className="py-2 px-2">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setActiveSubMenu(null);
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
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex-1 flex flex-col overflow-hidden">
        {/* Top navigation */}
        <header className="bg-card border-b border-border h-14 sm:h-16 flex items-center px-3 sm:px-6">
          {/* Left section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>

          {/* Center section - Search Bar */}
          <div className="flex-1 flex justify-center px-4">
            <div className="w-full max-w-md">
              <SearchBar />
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <ThemeToggle />
            <NotificationDropdown />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="page-container">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout 