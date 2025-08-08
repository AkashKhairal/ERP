import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Command, Users, FolderOpen, CheckSquare, Calendar, DollarSign, BarChart3, FileText, Settings, Shield, Key, User, Bell, TrendingUp, Target, Clock, Award, Globe, Lock, Sparkles, Home, Plus, Eye, Heart, MessageCircle, Share2, Download, Upload, Play } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { searchItemsByQuery, saveRecentSearch } from '../services/searchService';
import { useAuth } from '../context/AuthContext';

const SearchBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const { user } = useAuth();

  // Get filtered search items with error handling
  const filteredItems = React.useMemo(() => {
    try {
      return searchItemsByQuery(query);
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }, [query]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => {
            try {
              const totalItems = (filteredItems || []).reduce((sum, cat) => sum + (cat?.items?.length || 0), 0);
              return prev < totalItems - 1 ? prev + 1 : prev;
            } catch (error) {
              console.error('Arrow down error:', error);
              return prev;
            }
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
          break;
        case 'Enter':
          e.preventDefault();
          handleSelect();
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setQuery('');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
        setQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search selection
  const handleSelect = () => {
    try {
      let currentIndex = 0;
      for (const category of filteredItems || []) {
        for (const item of category?.items || []) {
          if (currentIndex === selectedIndex && item?.path) {
            saveRecentSearch(item);
            navigate(item.path);
            setIsOpen(false);
            setQuery('');
            return;
          }
          currentIndex++;
        }
      }
    } catch (error) {
      console.error('Selection error:', error);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setSelectedIndex(0);
    setIsOpen(true);
  };

  // Handle search focus
  const handleFocus = () => {
    if (query.trim()) {
      setIsOpen(true);
    }
  };

  // Get current selected item
  const getSelectedItem = () => {
    try {
      let currentIndex = 0;
      for (const category of filteredItems || []) {
        for (const item of category?.items || []) {
          if (currentIndex === selectedIndex) {
            return { category, item };
          }
          currentIndex++;
        }
      }
      return null;
    } catch (error) {
      console.error('Get selected item error:', error);
      return null;
    }
  };

  const selectedItem = getSelectedItem();

  return (
    <div className="relative flex-1 flex justify-center" ref={searchRef}>
      <div className="relative w-full max-w-md">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Search modules, features, actions..."
          className="pl-8 w-full"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={(e) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              inputRef.current?.focus();
            }
          }}
        />
        <div className="absolute right-2 top-2.5 flex items-center space-x-1">
          <Badge variant="secondary" className="text-xs">
            ⌘K
          </Badge>
        </div>

        {/* Search Results Dropdown */}
        {isOpen && query.trim() && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            {filteredItems && filteredItems.length > 0 ? (
              <div className="py-2">
                {filteredItems.map((category, categoryIndex) => (
                  <div key={categoryIndex}>
                    <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {category?.category || 'Unknown Category'}
                    </div>
                    {category?.items?.map((item, itemIndex) => {
                      if (!item || !item.title || !item.path) return null;
                      
                      const globalIndex = filteredItems
                        .slice(0, categoryIndex)
                        .reduce((sum, cat) => sum + (cat?.items?.length || 0), 0) + itemIndex;
                      
                      return (
                        <button
                          key={itemIndex}
                          className={`w-full px-4 py-3 text-left hover:bg-accent flex items-center space-x-3 ${
                            globalIndex === selectedIndex ? 'bg-accent' : ''
                          }`}
                          onClick={() => {
                            try {
                              saveRecentSearch(item);
                              navigate(item.path);
                              setIsOpen(false);
                              setQuery('');
                            } catch (error) {
                              console.error('Navigation error:', error);
                            }
                          }}
                        >
                          {item.icon && <item.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-foreground">{item.title}</div>
                            <div className="text-sm text-muted-foreground truncate">{item.description}</div>
                          </div>
                          <div className="text-xs text-muted-foreground">{item.path}</div>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No results found for "{query}"</p>
                <p className="text-sm">Try searching for modules, features, or actions</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar; 