// Configuration for different environments
export const config = {
  // API Configuration
  api: {
    // Development - Local backend
    development: {
      baseURL: 'http://localhost:5000/api',
      timeout: 10000
    },
    // Production - Render backend
    production: {
      baseURL: 'https://creatorbase-backend.onrender.com/api',
      timeout: 30000
    }
  },
  
  // Environment detection - check multiple sources
  isDevelopment: () => {
    // Check if we're running on localhost (development)
    if (typeof window !== 'undefined') {
      return window.location.hostname === 'localhost' || 
             window.location.hostname === '127.0.0.1';
    }
    // Server-side fallback
    return process.env.NODE_ENV === 'development';
  },
  
  isProduction: () => {
    // Check if we're running on production domains
    if (typeof window !== 'undefined') {
      return window.location.hostname !== 'localhost' && 
             window.location.hostname !== '127.0.0.1';
    }
    // Server-side fallback
    return process.env.NODE_ENV === 'production';
  },
  
  // Get current API configuration
  getApiConfig() {
    return this.isDevelopment() ? this.api.development : this.api.production
  }
}

export default config
