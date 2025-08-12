'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console
    console.error('🚨 Global Error Boundary Caught Error:', error)
    console.error('Error Stack:', error.stack)
    console.error('Error Message:', error.message)
    console.error('Error Name:', error.name)
    
    // Log additional context
    console.error('Current URL:', window.location.href)
    console.error('User Agent:', navigator.userAgent)
    console.error('Timestamp:', new Date().toISOString())
    
    // Try to get more context about the error
    if (error.stack) {
      const stackLines = error.stack.split('\n')
      console.error('Stack trace analysis:')
      stackLines.forEach((line, index) => {
        if (line.includes('permissionService') || line.includes('AuthContext') || line.includes('Layout')) {
          console.error(`Relevant stack line ${index}:`, line.trim())
        }
      })
    }
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Something went wrong!
          </h2>
          
          <p className="text-sm text-gray-600 mb-4">
            An error occurred while loading the application. This might be related to the permission system.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Try again
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Go to homepage
            </button>
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            <p>Error: {error.message}</p>
            <p>Check console for detailed error information</p>
          </div>
        </div>
      </div>
    </div>
  )
}
