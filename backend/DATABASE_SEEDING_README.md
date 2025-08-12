# Database Seeding Script

This script will completely reset your database and populate it with realistic sample data for testing and development purposes.

## ⚠️ WARNING

**This script will DELETE ALL existing data** from your database including:
- Users
- Roles
- Projects
- Teams
- Tasks
- All other related data

## 🚀 What Gets Created

### 1. Roles (5 roles)
- **Admin** - Full system administrator with all permissions
- **Project Manager** - Manages projects and teams
- **Team Lead** - Leads development teams
- **Developer** - Software developer
- **Analyst** - Business analyst with reporting access

### 2. Users (10 users)
- **Akash Khairal** - Senior Software Engineer (Admin)
- **Priya Sharma** - Project Manager
- **Rahul Verma** - Team Lead
- **Anjali Patel** - Frontend Developer
- **Vikram Singh** - Backend Developer
- **Meera Joshi** - Content Manager (Analyst)
- **Arjun Kumar** - Marketing Specialist (Analyst)
- **Sneha Reddy** - Financial Analyst
- **Karan Malhotra** - HR Manager
- **Zara Khan** - Operations Manager

### 3. Projects (3 projects)
- **ERP System Modernization** - 65% complete, high priority
- **Mobile App Development** - 15% complete, medium priority
- **Data Analytics Platform** - 100% complete, high priority

### 4. Teams (7 teams)
- **ERP System**: Frontend, Backend, DevOps teams
- **Mobile App**: Mobile Development, Backend Integration teams
- **Data Analytics**: Data Engineering, Analytics & Visualization teams

### 5. Sample Tasks
- UI Component Design
- Authentication System Implementation
- CI/CD Pipeline Setup

## 🔧 Prerequisites

1. **MongoDB** must be running
2. **Node.js** must be installed
3. **Backend dependencies** must be installed (`npm install`)
4. **Environment variables** must be configured (`.env` file)

## 📋 How to Run

### Option 1: Windows Batch File (Recommended)
```bash
# Double-click the file or run from command prompt
run-seed.bat
```

### Option 2: PowerShell Script
```bash
# Run from PowerShell
.\run-seed.ps1
```

### Option 3: Direct Node.js Command
```bash
# From the backend directory
node seed-database.js
```

### Option 4: Package.json Script (if added)
```bash
npm run seed
```

## 🔑 Default Login Credentials

After seeding, you can login with these accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | akash.khairal@company.com | Password123! |
| Project Manager | priya.sharma@company.com | Password123! |
| Team Lead | rahul.verma@company.com | Password123! |
| Developer | anjali.patel@company.com | Password123! |
| Developer | vikram.singh@company.com | Password123! |
| Analyst | meera.joshi@company.com | Password123! |

## 📊 Data Structure

### User Data Includes
- Full name, email, password
- Department, position, bio
- Phone, location, timezone
- Profile picture placeholder
- Proper role assignments
- Realistic Indian names and locations

### Project Data Includes
- Name, description, status
- Start/end dates, budget
- Priority, progress percentage
- Technologies and tags
- Project managers assigned

### Team Data Includes
- Team name and description
- Required skills
- Maximum members
- Team leads assigned
- Project associations

## 🧹 Cleanup

If you need to reset the database again, simply run the seeding script again. It will:
1. Delete all existing data
2. Create fresh sample data
3. Maintain referential integrity

## 🔍 Verification

After seeding, you can verify the data by:
1. Checking the console output for success messages
2. Logging into the system with the provided credentials
3. Navigating to different sections (Users, Roles, Projects, Teams)
4. Checking that role assignments work properly

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check your connection string in `.env`

2. **Model Import Errors**
   - Ensure all models exist in `src/models/`
   - Check file paths and exports

3. **Permission Errors**
   - Ensure you have write access to the database
   - Check MongoDB user permissions

4. **Validation Errors**
   - Check that all required fields are provided
   - Verify data types match schema requirements

### Debug Mode

The script includes detailed logging. If you encounter issues:
1. Check the console output for error messages
2. Verify that all models are properly imported
3. Ensure database connection is successful

## 📝 Customization

To modify the sample data:
1. Edit the arrays in `seed-database.js`
2. Add new sample data following the existing structure
3. Update the seeding logic if needed
4. Run the script again

## 🔄 Reverting

If you need to restore your original data:
1. **Backup first**: Always backup your database before running this script
2. **Use MongoDB tools**: Use `mongodump` to create backups
3. **Restore from backup**: Use `mongorestore` to restore your data

## 📞 Support

If you encounter issues:
1. Check the console output for error details
2. Verify your MongoDB connection
3. Ensure all dependencies are installed
4. Check that your models match the expected structure

---

**Remember**: This script is designed for development and testing. Never run it on a production database without proper backups!
