'use client'

import React, { useState, useEffect } from 'react'

const TestAuthOnlyPage = () => {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authContextStatus, setAuthContextStatus] = useState<string>('Not tested')

  useEffect(() => {
    const testAuthContext = async () => {
      try {
        console.log('🧪 Testing AuthContext import...')
        
        // Try to import AuthContext dynamically
        const { useAuth } = await import('@/context/AuthContext')
        console.log('✅ AuthContext import successful')
        
        // Test if we can use the hook
        setAuthContextStatus('Import successful - testing hook...')
        
        // Note: We can't actually call useAuth here because it's a hook
        // But we can verify the import worked
        setAuthContextStatus('Import successful - hook available')
        
      } catch (err) {
        console.error('❌ AuthContext import failed:', err)
        setAuthContextStatus(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    testAuthContext()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Testing AuthContext import...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">AuthContext Test Failed</h1>
          <p className="text-gray-700 mb-4">AuthContext import failed with error:</p>
          <pre className="bg-red-50 p-4 rounded text-sm text-red-800 overflow-auto">
            {error}
          </pre>
          <div className="mt-4 text-sm text-gray-600">
            <p>This means the issue is in the AuthContext file or its dependencies.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-600 mb-4">
            🎉 AuthContext Test Successful!
          </h1>
          <p className="text-xl text-gray-600">
            AuthContext can be imported without errors
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">✅ What's Working</h2>
            <ul className="space-y-2 text-gray-700">
              <li>• React component rendering</li>
              <li>• Dynamic imports</li>
              <li>• AuthContext import</li>
              <li>• Error handling</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">🔍 Test Results</h2>
            <div className="space-y-2">
              <p><strong>AuthContext Status:</strong></p>
              <p className="text-green-600 font-medium">{authContextStatus}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">🧪 Next Steps</h2>
          <p className="text-gray-700 mb-4">
            Since AuthContext works, the issue is likely in the permission services.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a 
              href="/test-minimal" 
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              Test Minimal Permission Service
            </a>
            <a 
              href="/test-no-icons" 
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              Test No-Icons Permission Service
            </a>
            <a 
              href="/test-permissions" 
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              Test Full Permission Service
            </a>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a 
            href="/test-minimal" 
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Next: Test Minimal Permission Service
          </a>
        </div>
      </div>
    </div>
  )
}

export default TestAuthOnlyPage
