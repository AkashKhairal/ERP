'use client'

import React from 'react'
import Layout from '@/components/Layout/Layout'

export default function TestDropdownPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Dropdown Test Page
            </h1>
            
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-blue-900 mb-2">
                  Profile Dropdown Features
                </h2>
                <ul className="text-blue-800 space-y-1">
                  <li>• Click on your profile picture in the sidebar to open the dropdown</li>
                  <li>• Navigate through main menu items (Account, Workspace, Analytics, etc.)</li>
                  <li>• Click on main menu items to expand/collapse sub-menus</li>
                  <li>• Each sub-menu contains relevant actions with descriptions</li>
                  <li>• Badges show status (Updated, Secure, Pro, Connected)</li>
                  <li>• External links are marked with an external link icon</li>
                  <li>• Responsive design works on mobile and desktop</li>
                  <li>• Keyboard navigation support (Escape to close)</li>
                  <li>• Click outside to close functionality</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-green-900 mb-2">
                  Menu Structure
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-green-800">
                  <div>
                    <h3 className="font-medium mb-2">Account</h3>
                    <ul className="text-sm space-y-1 ml-4">
                      <li>• Profile Settings</li>
                      <li>• Account Security</li>
                      <li>• Billing & Plans</li>
                      <li>• Preferences</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Workspace</h3>
                    <ul className="text-sm space-y-1 ml-4">
                      <li>• Team Settings</li>
                      <li>• Project Overview</li>
                      <li>• Task Management</li>
                      <li>• Sprint Planning</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Analytics</h3>
                    <ul className="text-sm space-y-1 ml-4">
                      <li>• Performance Dashboard</li>
                      <li>• Team Analytics</li>
                      <li>• Project Reports</li>
                      <li>• Custom Reports</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Integrations</h3>
                    <ul className="text-sm space-y-1 ml-4">
                      <li>• GitHub (Connected)</li>
                      <li>• Slack</li>
                      <li>• Google Workspace</li>
                      <li>• API Keys</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-purple-900 mb-2">
                  How to Test
                </h2>
                <ol className="text-purple-800 space-y-2 ml-4">
                  <li>1. Look for your profile picture in the left sidebar</li>
                  <li>2. Click on it to open the dropdown menu</li>
                  <li>3. Try clicking on different main menu items to expand sub-menus</li>
                  <li>4. Notice the smooth animations and hover effects</li>
                  <li>5. Test the responsive behavior by resizing your browser</li>
                  <li>6. Try using the Escape key to close the dropdown</li>
                  <li>7. Click outside the dropdown to close it</li>
                </ol>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-yellow-900 mb-2">
                  Technical Features
                </h2>
                <ul className="text-yellow-800 space-y-1">
                  <li>• TypeScript interfaces for type safety</li>
                  <li>• Responsive dropdown positioning (above/below)</li>
                  <li>• Smooth CSS transitions and animations</li>
                  <li>• Proper keyboard navigation support</li>
                  <li>• Click outside detection with useRef</li>
                  <li>• State management for sub-menu expansion</li>
                  <li>• Tailwind CSS for consistent styling</li>
                  <li>• Lucide React icons for visual consistency</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
