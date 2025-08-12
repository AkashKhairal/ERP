'use client'

import React from 'react'

const TestBasicPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Basic Test Page</h1>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">This is a basic test page</h2>
        <p>If you can see this page, the basic routing is working.</p>
        <p>This page doesn't use any permission services or complex imports.</p>
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>If this page works, the issue is in the permission services</li>
          <li>If this page doesn't work, there's a deeper routing/compilation issue</li>
          <li>Try navigating to <code>/test-minimal</code> next</li>
          <li>Then try <code>/test-simple</code></li>
          <li>Finally try <code>/test-permissions</code></li>
        </ul>
      </div>
    </div>
  )
}

export default TestBasicPage
