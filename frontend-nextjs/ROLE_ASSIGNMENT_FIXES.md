# Role Assignment Fixes

## Issues Identified and Fixed

### 1. Data Structure Mismatch
**Problem**: The frontend was looking for `user.roleId` but the backend stores roles in `user.roles` array.

**Solution**: Updated the `rolesService.ts` to properly transform backend response:
- Map `user.roles[0]` to `user.roleId` for frontend compatibility
- Ensure proper mapping of `firstName` + `lastName` to `name`
- Map `isActive` to `status` field
- Handle missing fields with fallbacks

### 2. Role Assignment Not Updating UI
**Problem**: After assigning roles, the UI wasn't refreshing to show the updated assignments.

**Solution**: 
- Made all role assignment functions `async` and await the `loadData()` call
- Added proper error handling and success messages
- Ensured the modal closes only after successful assignment

### 3. Status Column Not Fully Functional
**Problem**: The status column wasn't properly displaying user status.

**Solution**:
- Fixed status mapping from `isActive` boolean to `'active'/'inactive'` string
- Added fallback to 'Unknown' for missing status
- Ensured proper badge styling based on status

### 4. Data Refresh Issues
**Problem**: Data wasn't being refreshed properly after role assignments.

**Solution**:
- Added automatic data refresh when switching to assignments tab
- Added manual refresh button for assignments tab
- Improved data loading with better error handling

## Files Modified

### 1. `frontend-nextjs/src/services/rolesService.ts`
- Fixed `getUsers()` method to properly transform backend response
- Fixed `assignRoleToUser()` method to handle response correctly
- Fixed `removeRoleFromUser()` method to handle response correctly
- Fixed `bulkAssignRoles()` method to check for success

### 2. `frontend-nextjs/src/components/pages/Roles/RolesPermissions.tsx`
- Made role assignment functions async with proper await
- Added refresh button for assignments tab
- Added automatic data refresh when switching tabs
- Added debugging information to track data state
- Added data-testid for easier testing

## Key Changes Made

### Data Transformation
```typescript
// Before: Only mapped _id to id
id: user._id || user.id

// After: Complete data transformation
id: user._id || user.id,
roleId: user.roles && user.roles.length > 0 ? user.roles[0] : null,
status: user.isActive ? 'active' : 'inactive',
name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || user.lastName || user.email || 'Unknown User',
email: user.email || 'No Email',
department: user.department || 'No Department'
```

### Async Role Assignment
```typescript
// Before: Synchronous call
onClick={() => {
  handleAssignRole(userId, roleId)
  setIsAssignRoleOpen(false)
}}

// After: Async call with proper await
onClick={async () => {
  await handleAssignRole(userId, roleId)
  setIsAssignRoleOpen(false)
}}
```

### Data Refresh
```typescript
// Before: No automatic refresh
const handleTabChange = (value: string) => {
  setIsTabLoading(true)
  setActiveTab(value)
  setTimeout(() => setIsTabLoading(false), 300)
}

// After: Automatic refresh for assignments tab
const handleTabChange = (value: string) => {
  setIsTabLoading(true)
  setActiveTab(value)
  
  if (value === 'assignments') {
    loadData()
  }
  
  setTimeout(() => setIsTabLoading(false), 300)
}
```

## Testing

### Manual Testing Steps
1. Navigate to Roles → Assignments tab
2. Try assigning a role to a user
3. Verify the role assignment appears immediately
4. Try removing a role from a user
5. Verify the role removal appears immediately
6. Check that status column shows correct values
7. Use the refresh button to ensure data is current

### Debug Information
The assignments tab now shows:
- Total users count
- Users with roles count
- Last updated timestamp
- Console logs for debugging

### Test Script
A test script `test-role-assignment.js` has been created to verify functionality in the browser console.

## Expected Behavior After Fixes

1. **Role Assignment**: When assigning a role to a user, the assignment should appear immediately in the UI
2. **Role Removal**: When removing a role from a user, the removal should appear immediately in the UI
3. **Status Column**: Should properly display 'active' or 'inactive' for each user
4. **Data Refresh**: Data should automatically refresh when switching to assignments tab
5. **Real-time Updates**: All changes should be visible without manual page refresh

## Backend Compatibility

The fixes ensure compatibility with the existing backend API:
- Uses `/users/:id/roles` endpoint for role assignment
- Properly handles the `roles` array structure
- Maintains backward compatibility with existing user data

## Performance Considerations

- Data is only refreshed when necessary (tab switching, manual refresh)
- Proper error handling prevents unnecessary API calls
- Async operations don't block the UI
- Debug information helps identify performance issues
