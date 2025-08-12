'use client'

import React, { useState, useEffect } from 'react'

const TestIsolatedPage = () => {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Test basic functionality
    try {
      console.log('🧪 Testing basic React functionality...')
      
      // Test array methods
      const testArray = [1, 2, 3, 4, 5]
      const filtered = testArray.filter(x => x > 2)
      console.log('✅ Array filtering works:', filtered)
      
      // Test object methods
      const testObj = { a: 1, b: 2, c: 3 }
      const keys = Object.keys(testObj)
      console.log('✅ Object methods work:', keys)
      
      // Test async functionality
      setTimeout(() => {
        console.log('✅ Async functionality works')
        setIsLoading(false)
      }, 1000)
      
    } catch (err) {
      console.error('❌ Basic functionality test failed:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setIsLoading(false)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Testing basic functionality...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Test Failed</h1>
          <p className="text-gray-700 mb-4">Basic functionality test failed with error:</p>
          <pre className="bg-red-50 p-4 rounded text-sm text-red-800 overflow-auto">
            {error}
          </pre>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎉 Isolated Test Page Working!
          </h1>
          <p className="text-xl text-gray-600">
            This page doesn't import any external services or components
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">✅ What's Working</h2>
            <ul className="space-y-2 text-gray-700">
              <li>• React component rendering</li>
              <li>• useState and useEffect hooks</li>
              <li>• Basic JavaScript functionality</li>
              <li>• Tailwind CSS styling</li>
              <li>• Console logging</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">🔍 Next Steps</h2>
            <ul className="space-y-2 text-gray-700">
              <li>• Check browser console for test results</li>
              <li>• If this works, the issue is in external imports</li>
              <li>• Try importing AuthContext next</li>
              <li>• Then try permission services</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">🧪 Test Results</h2>
          <p className="text-gray-700 mb-4">
            Check your browser console (F12 → Console) to see the test results.
          </p>
          <div className="bg-gray-100 p-4 rounded text-sm font-mono">
            <p>Expected console output:</p>
            <p>🧪 Testing basic React functionality...</p>
            <p>✅ Array filtering works: [3, 4, 5]</p>
            <p>✅ Object methods work: ["a", "b", "c"]</p>
            <p>✅ Async functionality works</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a 
            href="/test-basic" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Next: Test Basic Page
          </a>
        </div>
      </div>
    </div>
  )
}

export default TestIsolatedPage
