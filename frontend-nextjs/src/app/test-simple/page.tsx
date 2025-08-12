'use client'

import React from 'react'
import { useAuth } from '@/context/AuthContext'
import { usePermissionsSimple } from '@/services/permissionServiceSimple'

const TestSimplePage = () => {
  const { user } = useAuth()
  const { userPermissions, hasPermission, hasModuleAccess } = usePermissionsSimple()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Simple Permission System Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          <div className="space-y-2">
            <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Roles:</strong> {user?.roles?.map((r: any) => r.name).join(', ') || 'None'}</p>
          </div>
        </div>

        {/* Permissions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">User Permissions</h2>
          <div className="space-y-2">
            <p><strong>Users Module:</strong> {hasModuleAccess('users') ? '✅ Access' : '❌ No Access'}</p>
            <p><strong>Can Create Users:</strong> {hasPermission('users', 'create') ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Can Delete Users:</strong> {hasPermission('users', 'delete') ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Projects Module:</strong> {hasModuleAccess('projects') ? '✅ Access' : '❌ No Access'}</p>
            <p><strong>Finance Module:</strong> {hasModuleAccess('finance') ? '✅ Access' : '❌ No Access'}</p>
          </div>
        </div>

        {/* Raw Permissions Data */}
        <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Raw Permissions Data</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(userPermissions, null, 2)}
          </pre>
        </div>

        {/* Test Buttons */}
        <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Permission Tests</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              className={`p-3 rounded ${hasPermission('users', 'create') ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
              disabled={!hasPermission('users', 'create')}
            >
              Create User
            </button>
            <button 
              className={`p-3 rounded ${hasPermission('users', 'delete') ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
              disabled={!hasPermission('users', 'delete')}
            >
              Delete User
            </button>
            <button 
              className={`p-3 rounded ${hasPermission('projects', 'create') ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
              disabled={!hasPermission('projects', 'create')}
            >
              Create Project
            </button>
            <button 
              className={`p-3 rounded ${hasPermission('finance', 'export') ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
              disabled={!hasPermission('finance', 'export')}
            >
              Export Finance
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestSimplePage
