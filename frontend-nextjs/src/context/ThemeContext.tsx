'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  systemTheme: Theme | null
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [systemTheme, setSystemTheme] = useState<Theme | null>(null)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  
  // Define public routes that should always be in light mode
  const publicRoutes = ['/', '/login', '/register', '/forgot-password']
  const isPublicRoute = publicRoutes.includes(pathname || '')

  // Handle system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }

    // Get initial system preference
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light')
    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null
    if (storedTheme) {
      setTheme(storedTheme)
    } else if (systemTheme) {
      setTheme(systemTheme)
    }
    setMounted(true)
  }, [systemTheme])

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement
    const body = document.body
    
    // Force light mode for public routes
    if (isPublicRoute) {
      root.classList.remove('light', 'dark')
      root.classList.add('light')
      root.style.colorScheme = 'light'
      body.style.backgroundColor = '#ffffff'
      body.style.color = '#000000'
      
      // Apply smooth transition class
      root.classList.add('theme-transition')
      const timeout = setTimeout(() => {
        root.classList.remove('theme-transition')
      }, 300)
      
      return () => clearTimeout(timeout)
    }
    
    // Apply normal theme for protected routes
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    root.style.colorScheme = theme
    
    // Reset body styles for protected routes (let CSS handle it)
    body.style.backgroundColor = ''
    body.style.color = ''

    // Apply smooth transition class
    root.classList.add('theme-transition')
    const timeout = setTimeout(() => {
      root.classList.remove('theme-transition')
    }, 300)

    // Store theme preference only if not on public route
    localStorage.setItem('theme', theme)

    return () => clearTimeout(timeout)
  }, [theme, mounted, isPublicRoute])

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
  }

  // Prevent flash of wrong theme
  if (!mounted) {
    return (
      <div style={{ visibility: 'hidden' }}>
        {children}
      </div>
    )
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, systemTheme }}>
      <style jsx global>{`
        .theme-transition * {
          transition: background-color 0.3s ease,
                      border-color 0.3s ease,
                      color 0.3s ease,
                      fill 0.3s ease,
                      stroke 0.3s ease,
                      opacity 0.3s ease,
                      box-shadow 0.3s ease !important;
        }

        /* Dark mode elevation styles */
        .dark [data-elevation="1"] {
          background-color: hsl(var(--surface-1));
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.4);
        }

        .dark [data-elevation="2"] {
          background-color: hsl(var(--surface-2));
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4),
                      0 2px 4px -2px rgba(0, 0, 0, 0.4);
        }

        .dark [data-elevation="3"] {
          background-color: hsl(var(--surface-3));
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4),
                      0 4px 6px -4px rgba(0, 0, 0, 0.4);
        }

        /* Dark mode hover effects */
        .dark .hover-elevation:hover {
          background-color: hsl(var(--bg-hover));
          transform: translateY(-1px);
          transition: all 0.2s ease;
        }

        /* Dark mode focus styles */
        .dark *:focus-visible {
          outline: 2px solid hsl(var(--ring));
          outline-offset: 2px;
        }

        /* Dark mode selection styles */
        .dark ::selection {
          background-color: hsl(var(--primary) / 0.2);
          color: hsl(var(--primary));
        }
      `}</style>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}