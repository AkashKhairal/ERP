# Comprehensive RBAC (Role-Based Access Control) Implementation Guide

## Overview

This document describes the comprehensive Role-Based Access Control (RBAC) system implemented in the ERP application. The system provides granular control over user permissions across different modules and actions, ensuring users can only access and perform actions they're authorized for.

## Key Features

### 1. **Dynamic Sidebar Navigation**
- Sidebar items automatically show/hide based on user permissions
- Users only see modules they have access to
- Maintains the exact same UI/UX as before

### 2. **Granular Permission System**
- **Modules**: 13 different modules (users, teams, projects, finance, etc.)
- **Actions**: 6 different actions (create, read, update, delete, approve, export)
- **Role-based**: Permissions are assigned through roles
- **User-level**: Custom permissions can override role permissions

### 3. **Permission Guards**
- UI components automatically check permissions
- Unauthorized actions show "Ask Admin for Permissions" button
- Toast notifications for permission denials
- Graceful fallbacks for unauthorized content

### 4. **Comprehensive Role Management**
- Create, edit, and delete roles
- Visual permission matrix
- Bulk permission selection
- Default role templates

## System Architecture

### Permission Structure

```
User
├── Roles (multiple)
│   ├── Module: users
│   │   ├── Actions: [create, read, update, delete, approve, export]
│   ├── Module: projects
│   │   ├── Actions: [create, read, update, approve]
│   └── Module: finance
│       ├── Actions: [read, export]
└── Custom Permissions (optional overrides)
    ├── Module: users
    │   └── Actions: [read, update]
```

### Available Modules

| Module | Description | Default Actions |
|--------|-------------|-----------------|
| `dashboard` | Overview and insights | read |
| `users` | User administration | create, read, update, delete, approve, export |
| `teams` | Team collaboration | create, read, update, delete, approve, export |
| `hr` | Employee management | create, read, update, delete, approve, export |
| `projects` | Project management | create, read, update, delete, approve, export |
| `tasks` | Task tracking | create, read, update, delete, approve, export |
| `sprints` | Sprint planning | create, read, update, delete, approve, export |
| `finance` | Financial overview | create, read, update, delete, approve, export |
| `analytics` | Data insights | create, read, update, delete, approve, export |
| `content` | Content management | create, read, update, delete, approve, export |
| `integrations` | Third-party connections | create, read, update, delete, approve, export |
| `settings` | System configuration | read, update |
| `roles` | Access control | create, read, update, delete, approve, export |

### Available Actions

| Action | Description | Example Use Case |
|--------|-------------|------------------|
| `create` | Can create new records | Adding new users, projects, tasks |
| `read` | Can view existing records | Viewing user profiles, project details |
| `update` | Can modify existing records | Editing user information, updating tasks |
| `delete` | Can remove records | Deleting users, removing projects |
| `approve` | Can approve requests/changes | Approving leave requests, project changes |
| `export` | Can export data to files | Downloading reports, user lists |

## Default Roles

### 1. **Admin**
- **Access**: All modules, all actions
- **Description**: Full system access, can manage roles and users
- **Use Case**: System administrators, IT managers

### 2. **HR Manager**
- **Access**: HR modules (employees, attendance, leaves, payroll), user management (read/update)
- **Description**: Manages employee data and HR processes
- **Use Case**: HR professionals, people managers

### 3. **Tech Lead**
- **Access**: Project modules (projects, tasks, sprints), team management
- **Description**: Manages development projects and technical teams
- **Use Case**: Engineering managers, project leads

### 4. **Content Manager**
- **Access**: Content management, project viewing
- **Description**: Manages content creation and publishing
- **Use Case**: Marketing managers, content creators

### 5. **Finance Manager**
- **Access**: Financial modules, payroll, analytics
- **Description**: Manages financial data and reporting
- **Use Case**: Finance professionals, accountants

### 6. **Employee**
- **Access**: Own profile, assigned tasks, basic viewing
- **Description**: Limited access to personal and assigned content
- **Use Case**: Regular employees, team members

## Implementation Details

### 1. **Permission Service** (`/src/services/permissionService.ts`)

The core permission checking service that provides:

```typescript
// Check if user has permission for a specific module and action
hasPermission(module: string, action: string): boolean

// Check if user has access to a module (any permission)
hasModuleAccess(module: string): boolean

// Get filtered navigation based on permissions
getFilteredNavigation(): NavigationItem[]

// Check if user is admin
isAdmin(): boolean
```

### 2. **Permission Guard Component** (`/src/components/PermissionGuard.tsx`)

A React component that wraps UI elements and automatically checks permissions:

```tsx
<PermissionGuard module="users" action="delete">
  <Button onClick={handleDelete}>Delete User</Button>
</PermissionGuard>
```

**Features:**
- Automatic permission checking
- Custom fallback content
- Toast notifications for unauthorized actions
- "Ask Admin for Permissions" button

### 3. **Dynamic Sidebar** (`/src/components/Layout/LuxurySidebar.tsx`)

The sidebar automatically filters navigation items based on user permissions:

```typescript
// Get filtered navigation based on user permissions
const navigation = getFilteredNavigation()
```

**Benefits:**
- Users only see modules they can access
- Maintains exact same UI/UX
- No manual permission checking needed
- Automatic updates when permissions change

### 4. **Role Management** (`/src/app/roles/page.tsx`)

Comprehensive role creation and management interface:

**Features:**
- Visual permission matrix
- Bulk permission selection
- Role templates
- Permission descriptions
- Module grouping

## Usage Examples

### 1. **Protecting UI Elements**

```tsx
import PermissionGuard from '@/components/PermissionGuard'

// Basic protection
<PermissionGuard module="users" action="create">
  <Button>Add User</Button>
</PermissionGuard>

// With custom fallback
<PermissionGuard 
  module="finance" 
  action="export"
  fallback={<Button disabled>Export (No Permission)</Button>}
>
  <Button>Export Data</Button>
</PermissionGuard>

// Without toast notification
<PermissionGuard 
  module="projects" 
  action="delete"
  showToast={false}
>
  <Button>Delete Project</Button>
</PermissionGuard>
```

### 2. **Checking Permissions in Components**

```tsx
import { usePermissions } from '@/services/permissionService'

const MyComponent = () => {
  const { hasPermission, canPerformAction } = usePermissions()
  
  const handleAction = () => {
    if (canPerformAction('users', 'delete')) {
      // Perform action
    } else {
      toast.error('Permission denied')
    }
  }
  
  return (
    <div>
      {hasPermission('analytics', 'export') && (
        <ExportButton />
      )}
    </div>
  )
}
```

### 3. **Creating Custom Roles**

```typescript
const customRole = {
  name: 'Project Manager',
  description: 'Manages projects and team assignments',
  permissions: [
    {
      module: 'projects',
      actions: ['create', 'read', 'update', 'approve']
    },
    {
      module: 'tasks',
      actions: ['create', 'read', 'update', 'approve']
    },
    {
      module: 'teams',
      actions: ['read', 'update']
    },
    {
      module: 'users',
      actions: ['read']
    }
  ]
}
```

## Security Features

### 1. **Backend Validation**
- All API endpoints validate permissions
- Middleware checks user roles and permissions
- Database-level permission enforcement

### 2. **Frontend Protection**
- UI elements automatically hide/show based on permissions
- Action buttons disabled for unauthorized users
- Graceful error handling for permission denials

### 3. **Audit Trail**
- All permission checks logged
- User actions tracked
- Role changes audited

## Best Practices

### 1. **Role Design**
- **Principle of Least Privilege**: Give users minimum permissions needed
- **Role Hierarchy**: Design roles with clear progression paths
- **Module Separation**: Keep related permissions together

### 2. **Permission Assignment**
- **Granular Control**: Use specific actions rather than broad permissions
- **Regular Review**: Periodically review and update permissions
- **Documentation**: Document role purposes and permission justifications

### 3. **User Experience**
- **Clear Feedback**: Always explain why actions are denied
- **Graceful Degradation**: Provide alternatives for unauthorized actions
- **Consistent Behavior**: Apply permissions consistently across the app

## Testing the System

### 1. **Permission Testing**
- Test each role with different permission combinations
- Verify sidebar shows/hides correct modules
- Test action buttons for each permission level

### 2. **Edge Cases**
- Users with no roles
- Users with conflicting permissions
- Admin override scenarios
- Permission inheritance

### 3. **Integration Testing**
- API endpoint permission validation
- Frontend-backend permission consistency
- Role assignment and removal
- Permission updates

## Troubleshooting

### Common Issues

1. **Sidebar not updating**
   - Check if user roles are properly populated
   - Verify permission service is working
   - Check browser console for errors

2. **Permission checks failing**
   - Ensure user has assigned roles
   - Check role permissions are correct
   - Verify backend permission validation

3. **UI elements not showing**
   - Check PermissionGuard component usage
   - Verify module and action names match
   - Check permission service configuration

### Debug Tools

```typescript
// Add to components for debugging
const { userPermissions, hasPermission } = usePermissions()
console.log('User permissions:', userPermissions)
console.log('Can create users:', hasPermission('users', 'create'))
```

## Future Enhancements

### 1. **Advanced Features**
- **Permission Inheritance**: Hierarchical permission structures
- **Time-based Permissions**: Temporary access grants
- **Conditional Permissions**: Context-aware access control
- **Permission Groups**: Batch permission management

### 2. **Integration**
- **SSO Integration**: Single sign-on permission mapping
- **LDAP Integration**: Active Directory role mapping
- **API Permissions**: External API access control
- **Mobile Permissions**: Mobile app permission management

### 3. **Analytics**
- **Permission Usage**: Track which permissions are used most
- **Access Patterns**: Analyze user access behavior
- **Security Audits**: Automated permission reviews
- **Compliance Reporting**: Generate permission reports

## Conclusion

This RBAC system provides a robust, scalable, and user-friendly way to manage access control across the ERP application. It maintains the existing UI/UX while adding comprehensive security and flexibility for role-based access management.

The system is designed to be:
- **Easy to use**: Simple role creation and management
- **Secure**: Backend and frontend permission validation
- **Flexible**: Custom permissions and role combinations
- **Scalable**: Handles complex permission scenarios
- **Maintainable**: Clear separation of concerns and modular design

For questions or support, refer to the development team or check the system logs for detailed error information.
