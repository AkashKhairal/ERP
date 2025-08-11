'use client'

import React, { useState, useEffect } from 'react'
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
  ChevronLeft,
  ChevronRight,
  User,
  Shield,
  Key,
  Zap,
  Activity,
  Building2,
  Search,
  Bell,
  Moon,
  Sun,
  UserCircle,
  ChevronDown,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'

interface LuxurySidebarProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
}

const LuxurySidebar = ({ isCollapsed, onToggleCollapse }: LuxurySidebarProps) => {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: Home,
      description: 'Overview and insights',
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      name: 'HR Management', 
      href: '/hr', 
      icon: Users,
      description: 'Employee management',
      gradient: 'from-green-500 to-emerald-500'
    },
    { 
      name: 'Users', 
      href: '/users', 
      icon: UserCircle,
      description: 'User administration',
      gradient: 'from-purple-500 to-violet-500'
    },
    { 
      name: 'Teams', 
      href: '/teams', 
      icon: Building2,
      description: 'Team collaboration',
      gradient: 'from-orange-500 to-red-500'
    },
    { 
      name: 'Projects', 
      href: '/projects', 
      icon: FolderOpen,
      description: 'Project management',
      gradient: 'from-indigo-500 to-purple-500'
    },
    { 
      name: 'Tasks', 
      href: '/tasks', 
      icon: CheckSquare,
      description: 'Task tracking',
      gradient: 'from-pink-500 to-rose-500'
    },
    { 
      name: 'Sprints', 
      href: '/sprints', 
      icon: Calendar,
      description: 'Sprint planning',
      gradient: 'from-teal-500 to-cyan-500'
    },
    { 
      name: 'Finance', 
      href: '/finance', 
      icon: DollarSign,
      description: 'Financial overview',
      gradient: 'from-yellow-500 to-orange-500'
    },
    { 
      name: 'Analytics', 
      href: '/analytics', 
      icon: BarChart3,
      description: 'Data insights',
      gradient: 'from-blue-600 to-indigo-600'
    },
    { 
      name: 'Content', 
      href: '/content', 
      icon: FileText,
      description: 'Content management',
      gradient: 'from-gray-600 to-gray-700'
    },
    { 
      name: 'Integrations', 
      href: '/integrations', 
      icon: Zap,
      description: 'Third-party apps',
      gradient: 'from-violet-500 to-purple-600'
    },
    { 
      name: 'Roles & Permissions', 
      href: '/roles-permissions', 
      icon: Shield,
      description: 'Access control',
      gradient: 'from-red-500 to-pink-500'
    },
  ]

  const isActive = (href: string) => {
    return pathname === href
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <>
      {/* Backdrop for mobile */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggleCollapse}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 flex flex-col
        bg-white/80 backdrop-blur-xl border-r border-gray-200/50
        shadow-2xl shadow-gray-900/10
        transition-all duration-300 ease-out
        ${isCollapsed ? 'w-20' : 'w-80'}
        lg:translate-x-0
        ${isCollapsed && 'lg:w-20'}
      `}>
        
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200/50">
          <div className={`flex items-center transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
            <div className="p-2 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-bold text-gray-900 tracking-tight">CreatorBase</h1>
              <p className="text-xs text-gray-500 font-medium tracking-tight">Premium Dashboard</p>
            </div>
          </div>
          
          {/* Collapse toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="rounded-full p-2 hover:bg-white/60 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-hide">
          {navigation.map((item, index) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group relative flex items-center rounded-2xl transition-all duration-200 ease-out
                  ${isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'}
                  ${active 
                    ? 'bg-gradient-to-r ' + item.gradient + ' text-white shadow-lg shadow-gray-900/20 scale-105' 
                    : 'text-gray-700 hover:bg-white/60 hover:shadow-md hover:scale-105'
                  }
                `}
                style={{
                  animationDelay: `${index * 50}ms`
                }}
              >
                {/* Icon container */}
                <div className={`
                  flex-shrink-0 flex items-center justify-center rounded-xl transition-all duration-200
                  ${active 
                    ? 'bg-white/20 backdrop-blur-sm' 
                    : 'bg-gray-100/80 group-hover:bg-white/80'
                  }
                  ${isCollapsed ? 'w-10 h-10' : 'w-10 h-10 mr-4'}
                `}>
                  <Icon className={`
                    h-5 w-5 transition-colors duration-200
                    ${active ? 'text-white' : 'text-gray-600 group-hover:text-gray-800'}
                  `} />
                </div>

                {/* Text content */}
                <div className={`
                  flex-1 min-w-0 transition-all duration-200
                  ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}
                `}>
                  <p className={`
                    text-sm font-semibold truncate tracking-tight
                    ${active ? 'text-white' : 'text-gray-900 group-hover:text-gray-900'}
                  `}>
                    {item.name}
                  </p>
                  <p className={`
                    text-xs truncate mt-0.5 font-medium tracking-tight
                    ${active ? 'text-white/80' : 'text-gray-500 group-hover:text-gray-600'}
                  `}>
                    {item.description}
                  </p>
                </div>

                {/* Active indicator */}
                {active && (
                  <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-full shadow-sm" />
                )}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-gray-300 text-xs">{item.description}</div>
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45" />
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-gray-200/50 p-4 flex-shrink-0">
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className={`
                w-full flex items-center rounded-2xl p-3 transition-all duration-200 ease-out
                hover:bg-white/60 hover:shadow-md group
                ${isCollapsed ? 'justify-center' : 'space-x-3'}
              `}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {user?.avatar ? (
                  <img
                    className="h-10 w-10 rounded-xl object-cover shadow-lg"
                    src={user.avatar}
                    alt={user.firstName}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                    <UserCircle className="h-6 w-6 text-white" />
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-white shadow-sm" />
              </div>

              {/* User info */}
              <div className={`
                flex-1 min-w-0 text-left transition-all duration-200
                ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}
              `}>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>

              {/* Dropdown arrow */}
              <ChevronDown className={`
                h-4 w-4 text-gray-400 transition-all duration-200
                ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}
                ${userDropdownOpen ? 'rotate-180' : ''}
              `} />
            </button>

            {/* User dropdown */}
            {userDropdownOpen && !isCollapsed && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden z-50">
                <div className="p-2 space-y-1">
                  <Link
                    href="/profile"
                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-white/60 rounded-xl transition-colors"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <User className="h-4 w-4 mr-3 text-gray-500" />
                    Profile Settings
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-white/60 rounded-xl transition-colors"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <Settings className="h-4 w-4 mr-3 text-gray-500" />
                    Preferences
                  </Link>
                  <button
                    onClick={toggleTheme}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-white/60 rounded-xl transition-colors"
                  >
                    {mounted && theme === 'dark' ? (
                      <Sun className="h-4 w-4 mr-3 text-gray-500" />
                    ) : (
                      <Moon className="h-4 w-4 mr-3 text-gray-500" />
                    )}
                    {mounted && theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </button>
                  <div className="border-t border-gray-200/50 my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-3 text-red-500" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}

            {/* Tooltip for collapsed user section */}
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                <div className="font-medium">{user?.firstName} {user?.lastName}</div>
                <div className="text-gray-300 text-xs">{user?.email}</div>
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add custom scrollbar styles */}
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  )
}

export default LuxurySidebar
