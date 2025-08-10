const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./src/models/User');
const Role = require('./src/models/Role');
const Employee = require('./src/models/Employee');
const Leave = require('./src/models/Leave');
const Attendance = require('./src/models/Attendance');
const Payroll = require('./src/models/Payroll');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`[seed-production] Connected to MongoDB: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('[seed-production] MongoDB connection error:', error);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('[seed-production] Disconnected from MongoDB');
  } catch (error) {
    console.error('[seed-production] Error disconnecting:', error);
  }
};

const seedProductionData = async () => {
  try {
    console.log('[seed-production] Starting production seeding...');

    // 1. Ensure admin role exists with all permissions
    let adminRole = await Role.findOne({ name: 'admin' });
    if (!adminRole) {
      adminRole = await Role.create({
        name: 'admin',
        description: 'Administrator with full system access',
        permissions: [
          { module: 'users', actions: ['create', 'read', 'update', 'delete'] },
          { module: 'employees', actions: ['create', 'read', 'update', 'delete'] },
          { module: 'attendance', actions: ['create', 'read', 'update', 'delete'] },
          { module: 'leaves', actions: ['create', 'read', 'update', 'delete', 'approve'] },
          { module: 'payroll', actions: ['create', 'read', 'update', 'delete'] },
          { module: 'projects', actions: ['create', 'read', 'update', 'delete'] },
          { module: 'tasks', actions: ['create', 'read', 'update', 'delete'] },
          { module: 'finance', actions: ['create', 'read', 'update', 'delete'] },
          { module: 'analytics', actions: ['read'] },
          { module: 'content', actions: ['create', 'read', 'update', 'delete'] },
          { module: 'integrations', actions: ['create', 'read', 'update', 'delete'] }
        ]
      });
      console.log('[seed-production] Created admin role');
    }

    // 2. Ensure HR role exists
    let hrRole = await Role.findOne({ name: 'hr' });
    if (!hrRole) {
      hrRole = await Role.create({
        name: 'hr',
        description: 'HR Administrator with HR module access',
        permissions: [
          { module: 'users', actions: ['read', 'update'] },
          { module: 'employees', actions: ['create', 'read', 'update', 'delete'] },
          { module: 'attendance', actions: ['read', 'update'] },
          { module: 'leaves', actions: ['read', 'update', 'approve'] },
          { module: 'payroll', actions: ['create', 'read', 'update'] }
        ]
      });
      console.log('[seed-production] Created HR role');
    }

    // 3. Check/Update admin@company.com user
    let adminUser = await User.findOne({ email: 'admin@company.com' });
    if (!adminUser) {
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 12);
      adminUser = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@company.com',
        password: hashedPassword,
        department: 'hr',
        position: 'Administrator',
        roles: [adminRole._id],
        isEmailVerified: true,
        status: 'active'
      });
      console.log('[seed-production] Created admin user');
    } else {
      // Update existing admin user with proper roles
      adminUser.roles = [adminRole._id];
      adminUser.department = 'hr';
      adminUser.position = 'Administrator';
      adminUser.status = 'active';
      await adminUser.save();
      console.log('[seed-production] Updated admin user roles');
    }

    // 4. Clear existing HR data (commented out for production safety)
    // Only clear if explicitly requested
    const shouldClearData = process.env.CLEAR_DATA === 'true';
    if (shouldClearData) {
      console.log('[seed-production] Clearing existing HR data...');
      await Employee.deleteMany({});
      await Leave.deleteMany({});
      await Attendance.deleteMany({});
      await Payroll.deleteMany({});
    }

    // 5. Create sample users for employees
    const users = [
      { firstName: 'Priya', lastName: 'Sharma', email: 'priya.sharma@company.com', department: 'engineering', position: 'Software Engineer' },
      { firstName: 'Rahul', lastName: 'Kumar', email: 'rahul.kumar@company.com', department: 'content', position: 'Content Writer' },
      { firstName: 'Anjali', lastName: 'Patel', email: 'anjali.patel@company.com', department: 'marketing', position: 'Marketing Manager' },
      { firstName: 'Vikram', lastName: 'Singh', email: 'vikram.singh@company.com', department: 'engineering', position: 'Senior Developer' },
      { firstName: 'Meera', lastName: 'Reddy', email: 'meera.reddy@company.com', department: 'hr', position: 'HR Executive' },
      { firstName: 'Arjun', lastName: 'Verma', email: 'arjun.verma@company.com', department: 'finance', position: 'Financial Analyst' },
      { firstName: 'Zara', lastName: 'Khan', email: 'zara.khan@company.com', department: 'content', position: 'Video Editor' },
      { firstName: 'Aditya', lastName: 'Joshi', email: 'aditya.joshi@company.com', department: 'engineering', position: 'DevOps Engineer' }
    ];

    const createdUsers = [];
    for (const userData of users) {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        const hashedPassword = await bcrypt.hash('password123', 12);
        user = await User.create({
          ...userData,
          password: hashedPassword,
          roles: [],
          isEmailVerified: true,
          status: 'active'
        });
        console.log(`[seed-production] Created user: ${user.firstName} ${user.lastName}`);
      } else {
        console.log(`[seed-production] Reusing existing user: ${user.firstName} ${user.lastName}`);
      }
      createdUsers.push(user);
    }

    // 6. Create employees
    const employees = [];
    let empCounter = 1;
    for (const user of createdUsers) {
      let employee = await Employee.findOne({ user: user._id });
      if (!employee) {
        employee = await Employee.create({
          user: user._id,
          employeeId: `EMP2025${empCounter.toString().padStart(4, '0')}`,
          phone: `+91${9000000000 + empCounter}`,
          dateOfJoining: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          aadharNumber: `${Math.floor(Math.random() * 900000000000) + 100000000000}`, // 12 digit Aadhar
          panNumber: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`, // PAN format
          salary: {
            base: Math.floor(Math.random() * 500000) + 300000, // 3L to 8L
            currency: 'INR'
          },
          skills: ['JavaScript', 'React', 'Node.js'].slice(0, Math.floor(Math.random() * 3) + 1),
          status: 'active'
        });
        console.log(`[seed-production] Created employee: ${user.firstName} ${user.lastName} (${employee.employeeId})`);
        empCounter++;
      } else {
        console.log(`[seed-production] Reusing existing employee: ${user.firstName} ${user.lastName} (${employee.employeeId})`);
      }
      employees.push(employee);
    }

    // 7. Create sample leaves
    const existingLeaves = await Leave.countDocuments();
    if (existingLeaves < 5) {
      const leaveTypes = ['sick', 'casual', 'annual', 'unpaid'];
      const leaveStatuses = ['pending', 'approved', 'rejected'];
      
      for (let i = 0; i < 12; i++) {
        const randomEmployee = employees[Math.floor(Math.random() * employees.length)];
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 60) - 30);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 5) + 1);

        const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        await Leave.create({
          employee: randomEmployee._id,
          leaveType: leaveTypes[Math.floor(Math.random() * leaveTypes.length)],
          startDate,
          endDate,
          totalDays: daysDiff,
          reason: `Sample leave request ${i + 1}`,
          status: leaveStatuses[Math.floor(Math.random() * leaveStatuses.length)],
          appliedDate: new Date()
        });
      }
      console.log('[seed-production] Created sample leaves');
    } else {
      console.log('[seed-production] Sample leaves already exist');
    }

    // 8. Create attendance records for last 30 working days
    const existingAttendance = await Attendance.countDocuments();
    if (existingAttendance < 50) {
      const attendanceRecords = [];
      for (const employee of employees) {
        for (let day = 30; day >= 0; day--) {
          const date = new Date();
          date.setDate(date.getDate() - day);
          
          // Skip weekends
          if (date.getDay() === 0 || date.getDay() === 6) continue;

          // Check if attendance already exists for this employee and date
          const existingRecord = await Attendance.findOne({ 
            employee: employee._id, 
            date: { $gte: new Date(date.setHours(0, 0, 0, 0)), $lt: new Date(date.setHours(23, 59, 59, 999)) }
          });
          
          if (!existingRecord) {
            const checkIn = new Date(date);
            checkIn.setHours(9, Math.floor(Math.random() * 60), 0, 0);
            
            const checkOut = new Date(date);
            checkOut.setHours(17 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60), 0, 0);

            attendanceRecords.push({
              employee: employee._id,
              date,
              checkIn,
              checkOut,
              totalHours: (checkOut - checkIn) / (1000 * 60 * 60),
              status: 'present'
            });
          }
        }
      }
      if (attendanceRecords.length > 0) {
        await Attendance.insertMany(attendanceRecords);
        console.log(`[seed-production] Created ${attendanceRecords.length} attendance records`);
      } else {
        console.log('[seed-production] All attendance records already exist');
      }
    } else {
      console.log('[seed-production] Sample attendance already exists');
    }

    // 9. Create payroll records for last 3 months
    const existingPayroll = await Payroll.countDocuments();
    if (existingPayroll < 10) {
      const payrollRecords = [];
      for (const employee of employees) {
        for (let month = 0; month < 3; month++) {
          const date = new Date();
          date.setMonth(date.getMonth() - month);
          
          // Check if payroll already exists for this employee and month
          const existingRecord = await Payroll.findOne({
            employee: employee._id,
            month: date.getMonth() + 1,
            year: date.getFullYear()
          });
          
          if (!existingRecord) {
            const baseSalary = employee.salary.base;
            const bonus = Math.floor(Math.random() * 50000);
            const deductions = Math.floor(Math.random() * 20000);

                    const grossSalary = baseSalary + bonus;
        payrollRecords.push({
          employee: employee._id,
          month: date.getMonth() + 1,
          year: date.getFullYear(),
          basicSalary: baseSalary,
          grossSalary,
          bonuses: { performance: bonus },
          deductions: { other: deductions },
          netSalary: grossSalary - deductions,
          status: month === 0 ? 'draft' : 'paid',
          generatedBy: adminUser._id
        });
          }
        }
      }
      if (payrollRecords.length > 0) {
        await Payroll.insertMany(payrollRecords);
        console.log(`[seed-production] Created ${payrollRecords.length} payroll records`);
      } else {
        console.log('[seed-production] All payroll records already exist');
      }
    } else {
      console.log('[seed-production] Sample payroll already exists');
    }

    console.log('[seed-production] ✅ Production seeding completed successfully!');
    console.log(`[seed-production] Users: ${createdUsers.length + 1}, Employees: ${employees.length}`);
    console.log('[seed-production] Admin user: admin@company.com / admin123');
    
  } catch (error) {
    console.error('[seed-production] Error during seeding:', error);
    throw error;
  }
};

const main = async () => {
  try {
    await connectDB();
    await seedProductionData();
  } catch (error) {
    console.error('[seed-production] Fatal error:', error);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { seedProductionData };
