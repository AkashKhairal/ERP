'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Command, Users, FolderOpen, CheckSquare, Calendar, DollarSign, BarChart3, FileText, Settings, Shield, Key, User, Bell, TrendingUp, Target, Clock, Award, Globe, Lock, Sparkles, Home, Plus, Eye, Heart, MessageCircle, Share2, Download, Upload, Play } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { searchItemsByQuery, saveRecentSearch } from '@/services/searchService'
import { useAuth } from '@/context/AuthContext'

const SearchBar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()

  // Get filtered search items with error handling
  const filteredItems = React.useMemo(() => {
    try {
      return searchItemsByQuery(query)
    } catch (error) {
      console.error('Search error:', error)
      return []
    }
  }, [query])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => {
            try {
              const totalItems = (filteredItems || []).reduce((sum, cat) => sum + (cat?.items?.length || 0), 0)
              return prev < totalItems - 1 ? prev + 1 : prev
            } catch (error) {
              console.error('Arrow down error:', error)
              return prev
            }
          })
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => prev > 0 ? prev - 1 : 0)
          break
        case 'Enter':
          e.preventDefault()
          handleSelect()
          break
        case 'Escape':
          e.preventDefault()
          setIsOpen(false)
          setQuery('')
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredItems])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setQuery('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle search selection
  const handleSelect = () => {
    try {
      let currentIndex = 0
      for (const category of filteredItems || []) {
        for (const item of category?.items || []) {
          if (currentIndex === selectedIndex && item?.path) {
            saveRecentSearch(item)
            router.push(item.path)
            setIsOpen(false)
            setQuery('')
            return
          }
          currentIndex++
        }
      }
    } catch (error) {
      console.error('Selection error:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setSelectedIndex(0)
    if (e.target.value.length > 0) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }

  const handleFocus = () => {
    if (query.length > 0) {
      setIsOpen(true)
    }
  }

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search anything..."
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          className="pl-10 pr-16 h-9 sm:h-10 text-sm rounded-full w-full bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && filteredItems && filteredItems.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg max-h-[60vh] sm:max-h-[70vh] overflow-y-auto z-50">
          {filteredItems.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              {category.items && category.items.length > 0 && (
                <>
                  <div className="px-3 sm:px-4 py-2 text-xs font-semibold text-muted-foreground bg-muted/50 sticky top-0">
                    {category.category}
                  </div>
                  {category.items.map((item, itemIndex) => {
                    const globalIndex = filteredItems
                      .slice(0, categoryIndex)
                      .reduce((sum, cat) => sum + (cat.items?.length || 0), 0) + itemIndex
                    const isSelected = globalIndex === selectedIndex
                    const Icon = item.icon

                    return (
                      <div
                        key={itemIndex}
                        className={`px-3 sm:px-4 py-2.5 sm:py-3 cursor-pointer hover:bg-muted transition-colors ${
                          isSelected ? 'bg-muted' : ''
                        }`}
                        onClick={() => {
                          saveRecentSearch(item)
                          router.push(item.path)
                          setIsOpen(false)
                          setQuery('')
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{item.title}</div>
                            <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchBar