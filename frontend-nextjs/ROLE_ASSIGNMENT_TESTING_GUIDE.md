# 🧪 Role Assignment Testing Guide

This guide will help you verify that the role assignment functionality is working perfectly in the Roles & Permissions module.

## 🎯 What We're Testing

1. **User Data Display** - Users show correctly in the assignments table
2. **Current Role Display** - Each user's assigned role is shown properly
3. **Role Assignment** - Can assign roles to users successfully
4. **Role Removal** - Can remove roles from users successfully
5. **Data Persistence** - Changes persist after page refresh
6. **Real-time Updates** - UI updates immediately after role changes

## 🚀 How to Test

### Step 1: Access the Roles & Permissions Page

1. **Login to the system** using one of these accounts:
   - **Admin**: akash.khairal@company.com / Password123!
   - **Project Manager**: priya.sharma@company.com / Password123!
   - **Team Lead**: rahul.verma@company.com / Password123!

2. **Navigate to**: `Roles & Permissions` in the sidebar

3. **Click on the "Assignments" tab** to see the user assignments table

### Step 2: Load the Test Script

1. **Open Browser Console** (F12 → Console tab)

2. **Copy and paste** the entire content of `test-role-assignments.js`

3. **Press Enter** to load the test script

4. **Wait for the auto-tests** to run (about 2 seconds)

### Step 3: Review the Test Results

The script will automatically run basic tests and show results like:

```
🧪 Testing Role Assignment Functionality...
✅ rolesService is available
✅ Roles permissions component found
🚀 Starting comprehensive testing...
📋 Test functions available:
- window.checkUserDataStructure()
- window.checkSpecificUser()
- window.testRoleAssignment()
- window.checkBackendAPI()
- window.checkDataTransformation()
- window.testDirectAPI()
- window.checkUIState()
- window.comprehensiveRoleTest()
✅ Test script loaded successfully!
🔄 Auto-running basic tests...
```

## 🔍 Manual Testing Steps

### Test 1: Check User Data Structure
```javascript
window.checkUserDataStructure()
```
**Expected Result**: Should show user data with proper `roleId` mapping

### Test 2: Check Specific User (Akash Khairal)
```javascript
window.checkSpecificUser()
```
**Expected Result**: Should show Akash with Admin role properly assigned

### Test 3: Check UI State
```javascript
window.checkUIState()
```
**Expected Result**: Should show users table with correct role information

### Test 4: Test Role Assignment
```javascript
window.testRoleAssignment()
```
**Expected Result**: Should successfully assign and remove a role

### Test 5: Comprehensive Test
```javascript
window.comprehensiveRoleTest()
```
**Expected Result**: Should run full end-to-end role assignment test

## ✅ What to Look For

### In the Console Output:

1. **✅ All tests should pass** without errors
2. **📊 User data should show proper structure**:
   - `id`: User ID
   - `name`: Full name (e.g., "Akash Khairal")
   - `email`: Email address
   - `roleId`: Assigned role ID
   - `role`: Role name
   - `status`: User status (active/inactive)
   - `department`: User department

3. **🎭 Role assignments should be correct**:
   - Akash Khairal → Admin
   - Priya Sharma → Project Manager
   - Rahul Verma → Team Lead
   - Anjali Patel → Developer
   - Vikram Singh → Developer

### In the UI Table:

1. **👥 Users table should display** all 10 users
2. **🎭 Current Role column should show**:
   - Role name with blue badge for assigned users
   - "Unassigned" with gray badge for users without roles
3. **📊 Status column should show** "active" or "inactive"
4. **🔄 Refresh buttons should work** and update data

## 🐛 Troubleshooting

### If Tests Fail:

1. **Check Console Errors** - Look for red error messages
2. **Verify Backend is Running** - Ensure MongoDB and Node.js server are active
3. **Check Authentication** - Make sure you're logged in with a valid token
4. **Verify Database Seeding** - Ensure the seeding script ran successfully

### Common Issues:

1. **"rolesService is not available"**
   - Make sure you're on the Roles & Permissions page
   - Check if the page has fully loaded

2. **"No users found"**
   - Verify the database seeding completed successfully
   - Check if the backend API is responding

3. **"Role assignment failed"**
   - Check backend logs for errors
   - Verify user and role IDs exist in the database

## 🎯 Success Criteria

The role assignment system is working correctly when:

1. **✅ All 10 users display** in the assignments table
2. **✅ Current roles show correctly** for each user
3. **✅ Role assignment works** without errors
4. **✅ Role removal works** without errors
5. **✅ UI updates immediately** after role changes
6. **✅ Data persists** after page refresh
7. **✅ All test functions pass** without errors

## 🔄 Testing Workflow

1. **Load the page** and wait for data to load
2. **Run the test script** in the console
3. **Review auto-test results** for any failures
4. **Run manual tests** to verify specific functionality
5. **Test UI interactions** (assign/remove roles)
6. **Verify data persistence** by refreshing the page

## 📞 Getting Help

If you encounter issues:

1. **Check the console output** for detailed error messages
2. **Verify the backend is running** and accessible
3. **Ensure database seeding** completed successfully
4. **Check network tab** for failed API calls
5. **Review the test results** to identify specific problems

---

**Remember**: The test script provides comprehensive debugging information. Use the console output to identify and resolve any issues with the role assignment functionality.
