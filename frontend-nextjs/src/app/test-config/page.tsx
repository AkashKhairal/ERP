'use client'

import { useEffect, useState } from 'react'
import config from '../../config/config'

export default function TestConfigPage() {
  const [configInfo, setConfigInfo] = useState<any>(null)
  const [testResult, setTestResult] = useState<any>(null)

  useEffect(() => {
    // Display configuration info
    setConfigInfo({
      isDevelopment: config.isDevelopment(),
      isProduction: config.isProduction(),
      apiConfig: config.getApiConfig(),
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'Server-side'
    })
  }, [])

  const testBackendConnection = async () => {
    try {
      const response = await fetch(config.getApiConfig().baseURL + '/debug')
      const data = await response.json()
      setTestResult({ success: true, data })
    } catch (error) {
      setTestResult({ success: false, error: error.message })
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Configuration Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Configuration Info */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Configuration Info</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(configInfo, null, 2)}
          </pre>
        </div>

        {/* Backend Test */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Backend Connection Test</h2>
          <button 
            onClick={testBackendConnection}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
          >
            Test Backend Connection
          </button>
          
          {testResult && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">
                {testResult.success ? '✅ Success' : '❌ Failed'}
              </h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Current API URL */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Current API Configuration</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p><strong>API Base URL:</strong> {config.getApiConfig().baseURL}</p>
          <p><strong>Environment:</strong> {config.isDevelopment() ? 'Development' : 'Production'}</p>
          <p><strong>Hostname:</strong> {typeof window !== 'undefined' ? window.location.hostname : 'Server-side'}</p>
        </div>
      </div>
    </div>
  )
}

