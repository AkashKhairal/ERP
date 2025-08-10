const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./src/models/User');
const Employee = require('./src/models/Employee');
const Leave = require('./src/models/Leave');
const Attendance = require('./src/models/Attendance');
const Payroll = require('./src/models/Payroll');

async function connectToDatabase() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/erp';
  await mongoose.connect(mongoUri, {
    autoIndex: true,
  });
  // eslint-disable-next-line no-console
  console.log(`[seed-hr-data] Connected to MongoDB: ${mongoUri}`);
}

async function clearHRData() {
  // Only clear HR-related collections; do not clear users
  await Promise.all([
    Employee.deleteMany({}),
    Leave.deleteMany({}),
    Attendance.deleteMany({}),
    Payroll.deleteMany({}),
  ]);
  // eslint-disable-next-line no-console
  console.log('[seed-hr-data] Cleared Employee, Leave, Attendance, Payroll collections');
}

function getSkillsByDepartment(department) {
  const skillsMap = {
    engineering: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Git'],
    content: ['Video Editing', 'Content Creation', 'Premiere Pro', 'After Effects'],
    marketing: ['SEO', 'Content Marketing', 'Google Ads', 'Analytics'],
    finance: ['Financial Analysis', 'Accounting', 'Excel', 'GST/TDS'],
    hr: ['Recruitment', 'HRIS', 'Onboarding', 'Compliance'],
    operations: ['Project Management', 'Process', 'Coordination', 'Reporting'],
  };
  return skillsMap[department] || ['General'];
}

function getSalaryByPosition(position) {
  const salaryMap = {
    'HR Manager': 80000,
    'Senior Software Engineer': 120000,
    'Content Creator': 60000,
    'Marketing Specialist': 70000,
    'Financial Analyst': 75000,
    'Frontend Developer': 90000,
    'Video Editor': 65000,
    'Operations Manager': 85000,
  };
  return salaryMap[position] || 50000;
}

function getCityByDepartment(department) {
  const cityMap = {
    engineering: 'Mumbai',
    content: 'Pune',
    marketing: 'Delhi',
    finance: 'Mumbai',
    hr: 'Mumbai',
    operations: 'Bengaluru',
  };
  return cityMap[department] || 'Mumbai';
}

function getLeaveReason(leaveType) {
  const reasons = {
    sick: 'Health reasons',
    casual: 'Personal work',
    annual: 'Vacation',
    unpaid: 'Extended personal leave',
  };
  return reasons[leaveType] || 'Personal reasons';
}

async function ensureUsers(users) {
  const createdUsers = [];
  for (const userData of users) {
    let user = await User.findOne({ email: userData.email }).select('+password');
    if (!user) {
      const hashed = await bcrypt.hash(userData.password, 12);
      user = new User({ ...userData, password: hashed });
      await user.save();
      // eslint-disable-next-line no-console
      console.log(`[seed-hr-data] Created user: ${user.firstName} ${user.lastName}`);
    } else {
      // eslint-disable-next-line no-console
      console.log(`[seed-hr-data] Reusing existing user: ${user.firstName} ${user.lastName}`);
    }
    createdUsers.push(user);
  }
  return createdUsers;
}

async function createEmployeesForUsers(users) {
  const hrManager = users.find((u) => u.position === 'HR Manager');
  const engineeringLead = users.find((u) => u.position === 'Senior Software Engineer');
  const operationsManager = users.find((u) => u.position === 'Operations Manager');

  const employees = [];
  // Base counter for generating sequential employee IDs in this seeding run
  const startingCount = await Employee.countDocuments();
  let createdIndex = 0;

  for (let i = 0; i < users.length; i += 1) {
    const user = users[i];

    // Determine reporting manager
    let reportingManagerId = null;
    if (user.department === 'hr' && operationsManager) reportingManagerId = operationsManager._id;
    if (user.department === 'engineering' && engineeringLead) reportingManagerId = engineeringLead._id;
    if (user.department === 'content' && hrManager) reportingManagerId = hrManager._id;
    if (user.department === 'marketing' && hrManager) reportingManagerId = hrManager._id;
    if (user.department === 'finance' && operationsManager) reportingManagerId = operationsManager._id;
    if (user.department === 'operations' && hrManager) reportingManagerId = hrManager._id;

    const existing = await Employee.findOne({ user: user._id });
    if (existing) {
      employees.push(existing);
      // eslint-disable-next-line no-console
      console.log(`[seed-hr-data] Reusing existing employee for user ${user.email}`);
      continue;
    }

    const employeeId = (() => {
      const year = new Date().getFullYear();
      const seq = String(startingCount + createdIndex + 1).padStart(4, '0');
      return `EMP${year}${seq}`;
    })();

    const employee = new Employee({
      employeeId,
      user: user._id,
      phone: user.phone || `+91987654${String(3000 + i).padStart(4, '0')}`,
      reportingManager: reportingManagerId,
      dateOfJoining: user.hireDate || new Date('2023-01-01'),
      panNumber: `ABCDE${String(i + 1).padStart(4, '0')}F`,
      aadharNumber: `${String(100000000000 + i).padStart(12, '0')}`,
      linkedin: `https://linkedin.com/in/${user.firstName.toLowerCase()}-${user.lastName.toLowerCase()}`,
      skills: getSkillsByDepartment(user.department),
      status: 'active',
      workType: 'full_time',
      salary: {
        base: getSalaryByPosition(user.position),
        currency: 'INR',
        effectiveFrom: user.hireDate || new Date('2023-01-01'),
      },
      leaveBalance: { sick: 12, casual: 12, annual: 21, unpaid: 0 },
      address: {
        street: `${Math.floor(Math.random() * 999) + 1} Main Street`,
        city: getCityByDepartment(user.department),
        state: 'Maharashtra',
        pincode: `${400000 + Math.floor(Math.random() * 99999)}`,
        country: 'India',
      },
      emergencyContact: {
        name: `${user.firstName} ${user.lastName} Sr.`,
        relationship: 'Parent',
        phone: `+91987654${String(1000 + i).padStart(4, '0')}`,
        email: `emergency.${user.email}`,
      },
      bankDetails: {
        accountNumber: `${String(700000000000 + i)}`,
        ifscCode: 'HDFC0001234',
        bankName: 'HDFC Bank',
        branch: 'Mumbai Main',
      },
      onboardingStatus: {
        isCompleted: true,
        completedSteps: [
          { step: 'Document Verification', completedAt: user.hireDate || new Date('2023-01-01'), completedBy: hrManager ? hrManager._id : user._id },
          { step: 'System Access', completedAt: new Date(), completedBy: hrManager ? hrManager._id : user._id },
          { step: 'Team Introduction', completedAt: new Date(), completedBy: hrManager ? hrManager._id : user._id },
        ],
        pendingSteps: [],
      },
    });

    const saved = await employee.save();
    createdIndex += 1;
    employees.push(saved);
    // eslint-disable-next-line no-console
    console.log(`[seed-hr-data] Created employee: ${user.firstName} ${user.lastName} (${saved.employeeId})`);
  }

  return employees;
}

async function createSampleLeaves(employees, hrApproverId) {
  const leaveTypes = ['sick', 'casual', 'annual', 'unpaid'];
  const statuses = ['pending', 'approved', 'rejected'];

  for (let i = 0; i < 16; i += 1) {
    const employee = employees[Math.floor(Math.random() * employees.length)];
    const leaveType = leaveTypes[Math.floor(Math.random() * leaveTypes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 15));
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 3));

    const totalDays = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1);

    await new Leave({
      employee: employee._id,
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason: getLeaveReason(leaveType),
      status,
      approvedBy: status === 'approved' ? hrApproverId : undefined,
      approvedAt: status === 'approved' ? new Date() : undefined,
      isHalfDay: Math.random() > 0.85,
      halfDayType: Math.random() > 0.5 ? 'first_half' : 'second_half',
    }).save();
  }
  // eslint-disable-next-line no-console
  console.log('[seed-hr-data] Created sample leaves');
}

async function createSampleAttendance(employees, approverId) {
  const today = new Date();
  for (let d = 29; d >= 0; d -= 1) {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - d);
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    // For each employee
    // eslint-disable-next-line no-restricted-syntax
    for (const emp of employees) {
      const inTime = new Date(date);
      inTime.setHours(9 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);
      const outTime = new Date(date);
      outTime.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);
      const totalHours = (outTime - inTime) / (1000 * 60 * 60);

      await new Attendance({
        employee: emp._id,
        date,
        checkIn: { time: inTime, location: 'Office', method: 'manual' },
        checkOut: { time: outTime, location: 'Office', method: 'manual' },
        totalHours,
        status: 'present',
        isApproved: true,
        approvedBy: approverId,
        approvedAt: new Date(),
      }).save();
    }
  }
  // eslint-disable-next-line no-console
  console.log('[seed-hr-data] Created sample attendance for last 30 working days');
}

async function createSamplePayroll(employees, approverId) {
  const now = new Date();
  const baseMonth = now.getMonth() + 1; // 1..12
  const year = now.getFullYear();
  for (let offset = 2; offset >= 0; offset -= 1) {
    let month = baseMonth - offset;
    let y = year;
    if (month <= 0) {
      month += 12;
      y -= 1;
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const emp of employees) {
      const base = emp.salary.base;
      const hra = Math.round(base * 0.4);
      const da = Math.round(base * 0.2);
      const pf = Math.round(base * 0.12);
      const tds = Math.round(base * 0.1);
      const gross = base + hra + da;
      const net = gross - pf - tds;

      await new Payroll({
        employee: emp._id,
        month,
        year: y,
        basicSalary: base,
        allowances: { hra, da, ta: 2000, medical: 1500, other: 1000 },
        deductions: { pf, tds, professionalTax: 200, other: 0 },
        bonuses: { performance: Math.random() > 0.75 ? Math.round(base * 0.1) : 0, festival: 0, other: 0 },
        grossSalary: gross,
        netSalary: net,
        status: 'paid',
        paymentDate: new Date(y, month - 1, 25),
        paymentMethod: 'bank_transfer',
        generatedBy: approverId,
      }).save();
    }
  }
  // eslint-disable-next-line no-console
  console.log('[seed-hr-data] Created sample payroll for last 3 months');
}

async function seedHRData() {
  try {
    await connectToDatabase();
    await clearHRData();

    const seedUsers = [
      {
        firstName: 'Priya',
        lastName: 'Sharma',
        email: 'priya.sharma@company.com',
        password: 'password123',
        department: 'hr',
        position: 'HR Manager',
        role: 'manager',
        isActive: true,
        phone: '+919876543210',
        hireDate: new Date('2023-01-15'),
        avatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=random',
      },
      {
        firstName: 'Rahul',
        lastName: 'Kumar',
        email: 'rahul.kumar@company.com',
        password: 'password123',
        department: 'engineering',
        position: 'Senior Software Engineer',
        role: 'team_lead',
        isActive: true,
        phone: '+919876543211',
        hireDate: new Date('2023-02-01'),
        avatar: 'https://ui-avatars.com/api/?name=Rahul+Kumar&background=random',
      },
      {
        firstName: 'Anjali',
        lastName: 'Patel',
        email: 'anjali.patel@company.com',
        password: 'password123',
        department: 'content',
        position: 'Content Creator',
        role: 'content_creator',
        isActive: true,
        phone: '+919876543212',
        hireDate: new Date('2023-03-01'),
        avatar: 'https://ui-avatars.com/api/?name=Anjali+Patel&background=random',
      },
      {
        firstName: 'Vikram',
        lastName: 'Singh',
        email: 'vikram.singh@company.com',
        password: 'password123',
        department: 'marketing',
        position: 'Marketing Specialist',
        role: 'developer',
        isActive: true,
        phone: '+919876543213',
        hireDate: new Date('2023-04-01'),
        avatar: 'https://ui-avatars.com/api/?name=Vikram+Singh&background=random',
      },
      {
        firstName: 'Meera',
        lastName: 'Reddy',
        email: 'meera.reddy@company.com',
        password: 'password123',
        department: 'finance',
        position: 'Financial Analyst',
        role: 'analyst',
        isActive: true,
        phone: '+919876543214',
        hireDate: new Date('2023-05-01'),
        avatar: 'https://ui-avatars.com/api/?name=Meera+Reddy&background=random',
      },
      {
        firstName: 'Arjun',
        lastName: 'Verma',
        email: 'arjun.verma@company.com',
        password: 'password123',
        department: 'engineering',
        position: 'Frontend Developer',
        role: 'developer',
        isActive: true,
        phone: '+919876543215',
        hireDate: new Date('2023-06-01'),
        avatar: 'https://ui-avatars.com/api/?name=Arjun+Verma&background=random',
      },
      {
        firstName: 'Zara',
        lastName: 'Khan',
        email: 'zara.khan@company.com',
        password: 'password123',
        department: 'content',
        position: 'Video Editor',
        role: 'content_creator',
        isActive: true,
        phone: '+919876543216',
        hireDate: new Date('2023-07-01'),
        avatar: 'https://ui-avatars.com/api/?name=Zara+Khan&background=random',
      },
      {
        firstName: 'Aditya',
        lastName: 'Joshi',
        email: 'aditya.joshi@company.com',
        password: 'password123',
        department: 'operations',
        position: 'Operations Manager',
        role: 'manager',
        isActive: true,
        phone: '+919876543217',
        hireDate: new Date('2023-08-01'),
        avatar: 'https://ui-avatars.com/api/?name=Aditya+Joshi&background=random',
      },
    ];

    const users = await ensureUsers(seedUsers);
    const employees = await createEmployeesForUsers(users);

    const hrManager = users.find((u) => u.position === 'HR Manager') || users[0];
    await createSampleLeaves(employees, hrManager._id);
    await createSampleAttendance(employees, hrManager._id);
    await createSamplePayroll(employees, hrManager._id);

    // eslint-disable-next-line no-console
    console.log(`[seed-hr-data] ✅ Completed. Users: ${users.length}, Employees: ${employees.length}`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[seed-hr-data] ❌ Error:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    // eslint-disable-next-line no-console
    console.log('[seed-hr-data] Disconnected from MongoDB');
  }
}

if (require.main === module) {
  seedHRData();
}

module.exports = { seedHRData };


