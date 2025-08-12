// Test script to demonstrate the RBAC permission system
// Run this in the browser console to test different permission scenarios

console.log('🔐 RBAC Permission System Test Script')
console.log('=====================================')

// Mock user data for testing
const mockUsers = {
  admin: {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@company.com',
    roles: [
      {
        name: 'Admin',
        permissions: [
          { module: 'users', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
          { module: 'projects', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
          { module: 'finance', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
          { module: 'analytics', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] }
        ]
      }
    ]
  },
  
  hrManager: {
    firstName: 'HR',
    lastName: 'Manager',
    email: 'hr@company.com',
    roles: [
      {
        name: 'HR Manager',
        permissions: [
          { module: 'users', actions: ['read', 'update'] },
          { module: 'hr', actions: ['create', 'read', 'update', 'approve', 'export'] },
          { module: 'employees', actions: ['create', 'read', 'update', 'approve', 'export'] }
        ]
      }
    ]
  },
  
  techLead: {
    firstName: 'Tech',
    lastName: 'Lead',
    email: 'tech@company.com',
    roles: [
      {
        name: 'Tech Lead',
        permissions: [
          { module: 'users', actions: ['read'] },
          { module: 'projects', actions: ['create', 'read', 'update', 'approve'] },
          { module: 'tasks', actions: ['create', 'read', 'update', 'approve'] }
        ]
      }
    ]
  },
  
  employee: {
    firstName: 'Regular',
    lastName: 'Employee',
    email: 'employee@company.com',
    roles: [
      {
        name: 'Employee',
        permissions: [
          { module: 'users', actions: ['read', 'update'] },
          { module: 'projects', actions: ['read'] },
          { module: 'tasks', actions: ['read', 'update'] }
        ]
      }
    ]
  }
}

// Permission checking functions (simplified version of the actual service)
function hasPermission(user, module, action) {
  if (!user?.roles) return false
  
  for (const role of user.roles) {
    const permission = role.permissions.find(p => p.module === module)
    if (permission && permission.actions.includes(action)) {
      return true
    }
  }
  return false
}

function hasModuleAccess(user, module) {
  if (!user?.roles) return false
  
  return user.roles.some(role => 
    role.permissions.some(p => p.module === module)
  )
}

function getAccessibleModules(user) {
  if (!user?.roles) return []
  
  const modules = new Set()
  user.roles.forEach(role => {
    role.permissions.forEach(permission => {
      modules.add(permission.module)
    })
  })
  
  return Array.from(modules)
}

// Test scenarios
function testUserPermissions(userKey, userData) {
  console.log(`\n👤 Testing ${userKey.toUpperCase()} permissions:`)
  console.log(`Name: ${userData.firstName} ${userData.lastName}`)
  console.log(`Email: ${userData.email}`)
  console.log(`Roles: ${userData.roles.map(r => r.name).join(', ')}`)
  
  // Test module access
  console.log('\n📋 Module Access:')
  const modules = ['users', 'projects', 'finance', 'analytics', 'hr', 'tasks']
  modules.forEach(module => {
    const hasAccess = hasModuleAccess(userData, module)
    console.log(`  ${module}: ${hasAccess ? '✅' : '❌'}`)
  })
  
  // Test specific permissions
  console.log('\n🔑 Specific Permissions:')
  const testPermissions = [
    { module: 'users', action: 'create' },
    { module: 'users', action: 'delete' },
    { module: 'projects', action: 'approve' },
    { module: 'finance', action: 'export' },
    { module: 'analytics', action: 'read' }
  ]
  
  testPermissions.forEach(({ module, action }) => {
    const hasPerm = hasPermission(userData, module, action)
    console.log(`  ${module}.${action}: ${hasPerm ? '✅' : '❌'}`)
  })
  
  // Show accessible modules
  const accessibleModules = getAccessibleModules(userData)
  console.log(`\n🚪 Total accessible modules: ${accessibleModules.length}`)
  console.log(`Modules: ${accessibleModules.join(', ')}`)
}

// Run tests for all user types
console.log('\n🧪 Running permission tests for all user types...')

Object.entries(mockUsers).forEach(([userKey, userData]) => {
  testUserPermissions(userKey, userData)
})

// Test specific scenarios
console.log('\n🎯 Testing specific scenarios:')

// Scenario 1: Can HR Manager delete users?
const hrUser = mockUsers.hrManager
const canDeleteUsers = hasPermission(hrUser, 'users', 'delete')
console.log(`HR Manager can delete users: ${canDeleteUsers ? '✅' : '❌'}`)

// Scenario 2: Can Tech Lead approve projects?
const techUser = mockUsers.techLead
const canApproveProjects = hasPermission(techUser, 'projects', 'approve')
console.log(`Tech Lead can approve projects: ${canApproveProjects ? '✅' : '❌'}`)

// Scenario 3: Can Employee access finance module?
const empUser = mockUsers.employee
const canAccessFinance = hasModuleAccess(empUser, 'finance')
console.log(`Employee can access finance: ${canAccessFinance ? '✅' : '❌'}`)

// Scenario 4: Admin permissions check
const adminUser = mockUsers.admin
const adminCanEverything = ['users', 'projects', 'finance', 'analytics'].every(module =>
  ['create', 'read', 'update', 'delete', 'approve', 'export'].every(action =>
    hasPermission(adminUser, module, action)
  )
)
console.log(`Admin has all permissions: ${adminCanEverything ? '✅' : '❌'}`)

console.log('\n✨ Permission system test completed!')
console.log('\nTo test in the actual app:')
console.log('1. Navigate to /roles to see role management')
console.log('2. Navigate to /users to see user management with permissions')
console.log('3. Check the sidebar - it should only show modules you have access to')
console.log('4. Try different actions - you should see permission denial messages')

// Export for use in browser console
window.testRBAC = {
  mockUsers,
  hasPermission,
  hasModuleAccess,
  getAccessibleModules,
  testUserPermissions
}
