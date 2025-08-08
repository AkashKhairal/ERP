import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
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
  Key
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ThemeToggle } from '../ui/theme-toggle';
import { useAuth } from '../../context/AuthContext';
import SearchBar from '../SearchBar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const profileDropdownRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
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
      // Cmd/Ctrl + K to focus search
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        // The search bar will handle its own focus
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/app/dashboard', icon: Home },
    { name: 'HR Management', href: '/app/hr', icon: Users },
    { name: 'Users', href: '/app/users', icon: Users },
    { name: 'Teams', href: '/app/teams', icon: Users },
    { name: 'Projects', href: '/app/projects', icon: FolderOpen },
    { name: 'Tasks', href: '/app/tasks', icon: CheckSquare },
    { name: 'Sprints', href: '/app/sprints', icon: Calendar },
    { name: 'Finance', href: '/app/finance', icon: DollarSign },
    { name: 'Analytics', href: '/app/analytics', icon: BarChart3 },
    { name: 'Content', href: '/app/content', icon: FileText },
    { name: 'Integrations', href: '/app/integrations', icon: Settings },
    { name: 'Roles & Permissions', href: '/app/roles-permissions', icon: Key },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (href) => {
    return location.pathname === href;
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">CB</span>
              </div>
              <span className="text-lg font-semibold text-foreground">CreatorBase</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${isActive(item.href)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 max-w-screen-2xl items-center">
            <div className="mr-4 hidden md:flex">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
              {/* Centered Search Bar */}
              <SearchBar />

              <nav className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    3
                  </Badge>
                </Button>

                <ThemeToggle />

                {/* Profile Dropdown */}
                <div className="relative" ref={profileDropdownRef}>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center space-x-2"
                  >
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full border-2 border-border"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-sm">
                          {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                        </span>
                      </div>
                    )}
                    <ChevronDown className="h-4 w-4" />
                  </Button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-md shadow-lg z-50">
                      <div className="py-2">
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-border">
                          <div className="flex items-center space-x-3">
                            {user?.avatar ? (
                              <img 
                                src={user.avatar} 
                                alt="Profile" 
                                className="w-10 h-10 rounded-full border-2 border-border"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-primary-foreground font-bold text-sm">
                                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {user?.firstName} {user?.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {user?.email}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {user?.department || 'Department'} • {user?.position || 'Position'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigate('/app/profile');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full justify-start px-4 py-2"
                        >
                          <UserCircle className="h-4 w-4 mr-2" />
                          Profile Settings
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigate('/app/profile');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full justify-start px-4 py-2"
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Account Security
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigate('/app/profile');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full justify-start px-4 py-2"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Notifications
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigate('/app/profile');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full justify-start px-4 py-2"
                        >
                          <HelpCircle className="h-4 w-4 mr-2" />
                          Help & Support
                        </Button>

                        <div className="border-t border-border mt-2 pt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              handleLogout();
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full justify-start px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </nav>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout; 