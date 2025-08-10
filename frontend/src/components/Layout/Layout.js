import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  UserCheck, 
  Building2, 
  FolderKanban, 
  Calendar, 
  BarChart3, 
  FileText, 
  Settings, 
  LogOut,
  User,
  Bell,
  Search,
  ChevronDown,
  Lock,
  CreditCard,
  Cog,
  BookOpen,
  MessageSquare,
  Zap,
  Globe,
  Key,
  HelpCircle,
  Heart,
  ExternalLink,
  TrendingUp,
  PieChart,
  BarChart,
  Shield
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [sidebarProfileDropdownOpen, setSidebarProfileDropdownOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const profileDropdownRef = useRef(null);
  const profileButtonRef = useRef(null);

  // Enhanced menu structure with sub-menus
  const profileMenuItems = [
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
          icon: FolderKanban,
          description: 'View all your projects'
        },
        {
          name: 'Task Management',
          href: '/tasks/dashboard',
          icon: FolderKanban,
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
  ];

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Teams', href: '/teams', icon: UserCheck },
    { name: 'Projects', href: '/projects', icon: Building2 },
    { name: 'Tasks', href: '/tasks', icon: FolderKanban },
    { name: 'Sprints', href: '/sprints', icon: Calendar },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Content', href: '/content', icon: FileText },
    { name: 'Finance', href: '/finance', icon: BarChart3 },
    { name: 'HR', href: '/hr', icon: Users },
    { name: 'Integrations', href: '/integrations', icon: Settings },
  ];

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
        setActiveSubMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Escape to close dropdown
      if (event.key === 'Escape' && (profileDropdownOpen || sidebarProfileDropdownOpen)) {
        setProfileDropdownOpen(false);
        setSidebarProfileDropdownOpen(false);
        setActiveSubMenu(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [profileDropdownOpen, sidebarProfileDropdownOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const isActive = (href) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  const getInitials = (firstName, lastName) => {
    if (!firstName && !lastName) return 'U';
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const toggleSubMenu = (menuName) => {
    if (activeSubMenu === menuName) {
      setActiveSubMenu(null);
    } else {
      setActiveSubMenu(menuName);
    }
  };

  const handleMenuItemClick = (href) => {
    setProfileDropdownOpen(false);
    setSidebarProfileDropdownOpen(false);
    setActiveSubMenu(null);
    navigate(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-gray-900">CreatorBase ERP</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
          
          {/* User profile section - Mobile */}
          <div className="border-t border-gray-200 p-4">
            <div className="relative">
              <button
                onClick={() => setSidebarProfileDropdownOpen(!sidebarProfileDropdownOpen)}
                className="flex items-center space-x-3 w-full text-left hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors"
              >
                <div className="flex-shrink-0">
                  {user?.avatar ? (
                    <img
                      className="h-8 w-8 rounded-full object-cover border-2 border-gray-200"
                      src={user.avatar}
                      alt="Profile"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {getInitials(user?.firstName, user?.lastName)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${sidebarProfileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Mobile Profile Dropdown with Sub-menus */}
              {sidebarProfileDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50 border border-gray-200 max-h-96 overflow-y-auto">
                  <div className="py-1">
                    {profileMenuItems.map((menuItem) => (
                      <div key={menuItem.name}>
                        {/* Main Menu Item */}
                        <button
                          onClick={() => toggleSubMenu(menuItem.name)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <menuItem.icon className="mr-3 h-4 w-4" />
                          <span className="flex-1 text-left">{menuItem.name}</span>
                          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${
                            activeSubMenu === menuItem.name ? 'rotate-180' : ''
                          }`} />
                        </button>

                        {/* Sub-menu Items */}
                        {activeSubMenu === menuItem.name && (
                          <div className="ml-4 border-l-2 border-gray-200 pl-4">
                            {menuItem.subItems.map((subItem) => (
                              <button
                                key={subItem.name}
                                onClick={() => handleMenuItemClick(subItem.href)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                              >
                                <subItem.icon className="mr-3 h-4 w-4" />
                                <span className="flex-1 text-left">{subItem.name}</span>
                                {subItem.badge && (
                                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${subItem.badgeColor}`}>
                                    {subItem.badge}
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    <div className="border-t border-gray-200 my-1"></div>
                    
                    <button
                      onClick={() => {
                        setSidebarProfileDropdownOpen(false);
                        setSidebarOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex items-center h-16 px-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">CreatorBase ERP</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
          
          {/* User profile section - Desktop */}
          <div className="border-t border-gray-200 p-4">
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-3 w-full text-left hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors"
              >
                <div className="flex-shrink-0">
                  {user?.avatar ? (
                    <img
                      className="h-8 w-8 rounded-full object-cover border-2 border-gray-200"
                      src={user.avatar}
                      alt="Profile"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {getInitials(user?.firstName, user?.lastName)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Desktop Profile Dropdown with Sub-menus */}
              {profileDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50 border border-gray-200 overflow-hidden" style={{ minWidth: '320px', maxHeight: '600px' }}>
                  {/* Header Section */}
                  <div className="px-4 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        {user?.avatar ? (
                          <img
                            className="h-12 w-12 rounded-full ring-2 ring-white shadow-sm"
                            src={user.avatar}
                            alt="Profile"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center ring-2 ring-white shadow-sm">
                            <User className="h-8 w-8 text-white" />
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-600 truncate">{user?.email}</p>
                        <p className="text-xs text-blue-600 font-medium">
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
                          className="flex items-center w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
                        >
                          <div className="p-2 bg-gray-100 rounded-lg mr-3 group-hover:bg-gray-200 transition-colors">
                            <menuItem.icon className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium">{menuItem.name}</p>
                            <p className="text-xs text-gray-500">{menuItem.description}</p>
                          </div>
                          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                            activeSubMenu === menuItem.name ? 'rotate-180' : ''
                          }`} />
                        </button>

                        {/* Sub-menu Items */}
                        {activeSubMenu === menuItem.name && (
                          <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-4">
                            {menuItem.subItems.map((subItem) => (
                              <button
                                key={subItem.name}
                                onClick={() => handleMenuItemClick(subItem.href)}
                                className="flex items-center w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors group"
                              >
                                <div className="p-1.5 bg-gray-50 rounded-md mr-3 group-hover:bg-gray-100 transition-colors">
                                  <subItem.icon className="h-3.5 w-3.5 text-gray-500" />
                                </div>
                                <div className="flex-1 text-left">
                                  <div className="flex items-center space-x-2">
                                    <p className="font-medium">{subItem.name}</p>
                                    {subItem.badge && (
                                      <span className={`text-xs px-2 py-1 rounded-full ${subItem.badgeColor}`}>
                                        {subItem.badge}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500">{subItem.description}</p>
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
                  <div className="border-t border-gray-100 my-2"></div>

                  {/* Quick Actions */}
                  <div className="py-2 px-2">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setActiveSubMenu(null);
                        handleLogout();
                      }}
                      className="flex w-full items-center px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
                    >
                      <div className="p-2 bg-red-100 rounded-lg mr-3 group-hover:bg-red-200 transition-colors">
                        <LogOut className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium">Sign Out</p>
                        <p className="text-xs text-red-500">End your session</p>
                      </div>
                    </button>
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500">
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
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Search bar */}
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="block h-full w-full border-0 py-0 pl-10 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-gray-500">
              <Bell className="h-6 w-6" />
              <span className="sr-only">View notifications</span>
            </button>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <div className="relative">
                  {user?.avatar ? (
                    <img
                      className="h-8 w-8 rounded-full object-cover border-2 border-gray-200"
                      src={user.avatar}
                      alt="Profile"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {getInitials(user?.firstName, user?.lastName)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-700">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {/* Top Navigation Profile Dropdown with Sub-menus */}
              {profileDropdownOpen && (
                <div 
                  ref={profileDropdownRef}
                  className="absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 overflow-hidden"
                  style={{ maxHeight: '600px' }}
                >
                  {/* Header Section */}
                  <div className="px-4 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        {user?.avatar ? (
                          <img
                            className="h-12 w-12 rounded-full ring-2 ring-white shadow-sm"
                            src={user.avatar}
                            alt="Profile"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center ring-2 ring-white shadow-sm">
                            <User className="h-8 w-8 text-white" />
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-600 truncate">{user?.email}</p>
                        <p className="text-xs text-blue-600 font-medium">
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
                          className="flex items-center w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
                        >
                          <div className="p-2 bg-gray-100 rounded-lg mr-3 group-hover:bg-gray-200 transition-colors">
                            <menuItem.icon className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium">{menuItem.name}</p>
                            <p className="text-xs text-gray-500">{menuItem.description}</p>
                          </div>
                          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                            activeSubMenu === menuItem.name ? 'rotate-180' : ''
                          }`} />
                        </button>

                        {/* Sub-menu Items */}
                        {activeSubMenu === menuItem.name && (
                          <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-4">
                            {menuItem.subItems.map((subItem) => (
                              <button
                                key={subItem.name}
                                onClick={() => handleMenuItemClick(subItem.href)}
                                className="flex items-center w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors group"
                              >
                                <div className="p-1.5 bg-gray-50 rounded-md mr-3 group-hover:bg-gray-100 transition-colors">
                                  <subItem.icon className="h-3.5 w-3.5 text-gray-500" />
                                </div>
                                <div className="flex-1 text-left">
                                  <div className="flex items-center space-x-2">
                                    <p className="font-medium">{subItem.name}</p>
                                    {subItem.badge && (
                                      <span className={`text-xs px-2 py-1 rounded-full ${subItem.badgeColor}`}>
                                        {subItem.badge}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500">{subItem.description}</p>
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
                  <div className="border-t border-gray-100 my-2"></div>

                  {/* Quick Actions */}
                  <div className="py-2 px-2">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setActiveSubMenu(null);
                        handleLogout();
                      }}
                      className="flex w-full items-center px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
                    >
                      <div className="p-2 bg-red-100 rounded-lg mr-3 group-hover:bg-red-200 transition-colors">
                        <LogOut className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium">Sign Out</p>
                        <p className="text-xs text-red-500">End your session</p>
                      </div>
                    </button>
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500">
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

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Click outside to close profile dropdowns */}
      {(profileDropdownOpen || sidebarProfileDropdownOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setProfileDropdownOpen(false);
            setSidebarProfileDropdownOpen(false);
            setActiveSubMenu(null);
          }}
        />
      )}
    </div>
  );
};

export default Layout; 