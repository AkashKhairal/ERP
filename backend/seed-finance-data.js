const mongoose = require('mongoose');
const { Transaction, Budget, Invoice, TaxRecord } = require('./src/models/Finance');
const User = require('./src/models/User');
const Employee = require('./src/models/Employee');
const Project = require('./src/models/Project');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erp-system');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedFinanceData = async () => {
  try {
    // Clear existing finance data
    await Transaction.deleteMany({});
    await Budget.deleteMany({});
    await Invoice.deleteMany({});
    await TaxRecord.deleteMany({});
    console.log('Cleared existing finance data');

    // Get existing users, employees, and projects for references
    const users = await User.find().limit(5);
    const employees = await Employee.find().limit(10);
    const projects = await Project.find().limit(5);

    if (users.length === 0) {
      console.log('No users found. Please run user seed first.');
      return;
    }

    const adminUser = users[0]; // Assume first user is admin

    // Helper function to get random date within last 6 months
    const getRandomDate = (daysBack = 180) => {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
      return date;
    };

    // Helper function to get random array element
    const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // Income Categories and Sample Data
    const incomeData = [
      { category: 'youtube_adsense', descriptions: ['YouTube AdSense Revenue', 'Ad Revenue Payment', 'Monthly AdSense Payout'], amounts: [5000, 8500, 12000, 15000] },
      { category: 'paid_courses', descriptions: ['Course Sales Revenue', 'Premium Course Enrollment', 'Udemy Course Sales'], amounts: [25000, 45000, 65000, 85000] },
      { category: 'client_projects', descriptions: ['Web Development Project', 'Mobile App Development', 'SaaS Integration Project', 'E-commerce Platform'], amounts: [50000, 120000, 200000, 350000] },
      { category: 'sponsorships', descriptions: ['Brand Sponsorship Deal', 'Video Sponsorship', 'Product Partnership'], amounts: [15000, 30000, 50000, 75000] },
      { category: 'affiliate_income', descriptions: ['Amazon Affiliate Commission', 'Software Referral Bonus', 'Tool Recommendation Payout'], amounts: [2000, 5000, 8000, 12000] },
      { category: 'freelance', descriptions: ['Freelance Consultation', 'Code Review Service', 'Technical Writing'], amounts: [8000, 15000, 25000, 40000] },
      { category: 'consulting', descriptions: ['Technical Consulting', 'Business Strategy Consultation', 'Architecture Review'], amounts: [20000, 40000, 80000, 150000] }
    ];

    // Expense Categories and Sample Data
    const expenseData = [
      { category: 'salary', descriptions: ['Employee Salary Payment', 'Monthly Salary Disbursement', 'Contractor Payment'], amounts: [30000, 50000, 80000, 120000] },
      { category: 'marketing', descriptions: ['Google Ads Campaign', 'Facebook Marketing', 'LinkedIn Ads', 'Content Promotion'], amounts: [5000, 10000, 20000, 35000] },
      { category: 'saas_tools', descriptions: ['AWS Infrastructure', 'Figma Subscription', 'GitHub Pro', 'Slack Premium', 'Notion Team Plan'], amounts: [2000, 5000, 8000, 15000] },
      { category: 'freelancers', descriptions: ['Video Editor Payment', 'Graphic Designer Fee', 'Content Writer Payment'], amounts: [8000, 15000, 25000, 40000] },
      { category: 'rent', descriptions: ['Office Rent Payment', 'Co-working Space Fee', 'Equipment Rental'], amounts: [25000, 40000, 60000] },
      { category: 'utilities', descriptions: ['Internet Bill', 'Electricity Bill', 'Phone Bill'], amounts: [2000, 4000, 6000] },
      { category: 'office_supplies', descriptions: ['Laptop Purchase', 'Monitor Setup', 'Office Furniture', 'Stationery'], amounts: [15000, 35000, 65000, 120000] },
      { category: 'travel', descriptions: ['Conference Attendance', 'Client Meeting Travel', 'Team Offsite'], amounts: [5000, 15000, 30000, 50000] },
      { category: 'meals', descriptions: ['Team Lunch', 'Client Dinner', 'Office Catering'], amounts: [1000, 3000, 8000] }
    ];

    const paymentMethods = ['upi', 'bank_transfer', 'card', 'paypal', 'stripe', 'cash'];

    // Generate Income Transactions
    const incomeTransactions = [];
    for (let i = 0; i < 50; i++) {
      const incomeType = getRandomElement(incomeData);
      const transaction = {
        type: 'income',
        category: incomeType.category,
        amount: getRandomElement(incomeType.amounts),
        description: getRandomElement(incomeType.descriptions),
        date: getRandomDate(),
        paymentMethod: getRandomElement(paymentMethods),
        status: 'completed',
        linkedProject: projects.length > 0 ? (Math.random() > 0.6 ? getRandomElement(projects)._id : null) : null,
        linkedEmployee: employees.length > 0 ? (Math.random() > 0.7 ? getRandomElement(employees)._id : null) : null,
        tags: ['revenue', incomeType.category],
        notes: `Generated income from ${incomeType.category.replace('_', ' ')} activities`,
        createdBy: adminUser._id
      };
      incomeTransactions.push(transaction);
    }

    // Generate Expense Transactions
    const expenseTransactions = [];
    for (let i = 0; i < 80; i++) {
      const expenseType = getRandomElement(expenseData);
      const transaction = {
        type: 'expense',
        category: expenseType.category,
        amount: getRandomElement(expenseType.amounts),
        description: getRandomElement(expenseType.descriptions),
        date: getRandomDate(),
        paymentMethod: getRandomElement(paymentMethods),
        status: Math.random() > 0.1 ? 'completed' : 'pending',
        linkedProject: projects.length > 0 ? (Math.random() > 0.5 ? getRandomElement(projects)._id : null) : null,
        linkedEmployee: employees.length > 0 ? (Math.random() > 0.6 ? getRandomElement(employees)._id : null) : null,
        tags: ['expense', expenseType.category],
        notes: `${expenseType.category.replace('_', ' ')} expense for business operations`,
        createdBy: adminUser._id
      };
      expenseTransactions.push(transaction);
    }

    // Create all transactions
    const allTransactions = [...incomeTransactions, ...expenseTransactions];
    await Transaction.insertMany(allTransactions);
    console.log(`Created ${allTransactions.length} transactions`);

    // Create Budgets
    const budgetCategories = ['salary', 'marketing', 'saas_tools', 'freelancers', 'rent', 'utilities', 'office_supplies', 'travel', 'meals'];
    const budgets = [];

    for (const category of budgetCategories) {
      // Monthly budget
      const monthlyBudget = {
        name: `Monthly ${category.replace('_', ' ').toUpperCase()} Budget`,
        category: category,
        amount: Math.floor(Math.random() * 100000) + 20000, // 20k to 120k
        period: 'monthly',
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
        isActive: true,
        createdBy: adminUser._id
      };
      budgets.push(monthlyBudget);

      // Quarterly budget
      const quarterlyBudget = {
        name: `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${category.replace('_', ' ').toUpperCase()} Budget`,
        category: category,
        amount: Math.floor(Math.random() * 300000) + 60000, // 60k to 360k
        period: 'quarterly',
        startDate: new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3, 1),
        endDate: new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3 + 3, 0),
        isActive: true,
        createdBy: adminUser._id
      };
      budgets.push(quarterlyBudget);
    }

    await Budget.insertMany(budgets);
    console.log(`Created ${budgets.length} budgets`);

    // Create Invoices
    const clientNames = [
      'Tech Solutions Inc', 'Digital Marketing Pro', 'StartUp Accelerator', 'E-commerce Giants',
      'Mobile First LLC', 'Cloud Computing Corp', 'AI Innovations Ltd', 'Data Analytics Hub',
      'Web Development Studio', 'Creative Design Agency', 'Software Consulting Group', 'FinTech Pioneers'
    ];

    const invoices = [];
    for (let i = 0; i < 20; i++) {
      const clientName = getRandomElement(clientNames);
      const issueDate = getRandomDate(90); // Last 3 months
      const dueDate = new Date(issueDate);
      dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 45) + 15); // 15-60 days from issue

      const items = [];
      const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items
      
      for (let j = 0; j < numItems; j++) {
        const services = [
          'Web Development Services', 'Mobile App Development', 'UI/UX Design',
          'Backend API Development', 'Database Design', 'DevOps Setup',
          'Technical Consultation', 'Code Review', 'Performance Optimization'
        ];
        
        const service = getRandomElement(services);
        const quantity = Math.floor(Math.random() * 50) + 10; // 10-60 hours
        const unitPrice = Math.floor(Math.random() * 3000) + 1000; // 1000-4000 per hour
        
        items.push({
          description: service,
          quantity: quantity,
          unitPrice: unitPrice,
          amount: quantity * unitPrice
        });
      }

      const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
      const taxRate = 18; // 18% GST
      const taxAmount = (subtotal * taxRate) / 100;
      const total = subtotal + taxAmount;

      const statuses = ['draft', 'sent', 'paid', 'overdue'];
      const status = getRandomElement(statuses);
      
      const invoice = {
        invoiceNumber: `INV-${new Date().getFullYear()}-${(i + 1).toString().padStart(4, '0')}`,
        clientName: clientName,
        clientEmail: `contact@${clientName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.com`,
        clientAddress: `${Math.floor(Math.random() * 999) + 1} Business Park, Tech City, India`,
        items: items,
        subtotal: subtotal,
        taxRate: taxRate,
        taxAmount: taxAmount,
        total: total,
        issueDate: issueDate,
        dueDate: dueDate,
        status: status,
        paymentDate: status === 'paid' ? new Date(dueDate.getTime() - Math.random() * 10 * 24 * 60 * 60 * 1000) : null,
        notes: `Invoice for ${items[0].description} and related services`,
        linkedProject: projects.length > 0 ? (Math.random() > 0.4 ? getRandomElement(projects)._id : null) : null,
        createdBy: adminUser._id
      };

      invoices.push(invoice);
    }

    await Invoice.insertMany(invoices);
    console.log(`Created ${invoices.length} invoices`);

    // Create Tax Records
    const taxRecords = [];
    const currentYear = new Date().getFullYear();
    const taxTypes = ['gst_paid', 'gst_collected', 'tds_deducted', 'tds_collected'];

    for (let month = 1; month <= 12; month++) {
      for (const taxType of taxTypes) {
        if (month <= new Date().getMonth() + 1) { // Only create for past and current month
          const amount = Math.floor(Math.random() * 50000) + 5000; // 5k to 55k
          const dueDate = new Date(currentYear, month, 15); // 15th of each month
          
          const taxRecord = {
            type: taxType,
            amount: amount,
            period: { month: month, year: currentYear },
            description: `${taxType.replace('_', ' ').toUpperCase()} for ${new Date(currentYear, month - 1).toLocaleString('default', { month: 'long' })} ${currentYear}`,
            status: month < new Date().getMonth() + 1 ? 'filed' : 'pending',
            dueDate: dueDate,
            filedDate: month < new Date().getMonth() + 1 ? new Date(dueDate.getTime() + Math.random() * 10 * 24 * 60 * 60 * 1000) : null,
            createdBy: adminUser._id
          };
          
          taxRecords.push(taxRecord);
        }
      }
    }

    await TaxRecord.insertMany(taxRecords);
    console.log(`Created ${taxRecords.length} tax records`);

    console.log('\n✅ Finance data seeding completed successfully!');
    console.log('\nSummary:');
    console.log(`- ${incomeTransactions.length} income transactions`);
    console.log(`- ${expenseTransactions.length} expense transactions`);
    console.log(`- ${budgets.length} budgets`);
    console.log(`- ${invoices.length} invoices`);
    console.log(`- ${taxRecords.length} tax records`);

    // Calculate and display statistics
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalIncome - totalExpenses;
    
    console.log('\nFinancial Summary:');
    console.log(`- Total Income: ₹${totalIncome.toLocaleString()}`);
    console.log(`- Total Expenses: ₹${totalExpenses.toLocaleString()}`);
    console.log(`- Net Profit: ₹${netProfit.toLocaleString()}`);
    console.log(`- Profit Margin: ${((netProfit / totalIncome) * 100).toFixed(2)}%`);

  } catch (error) {
    console.error('Error seeding finance data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
};

// Run the seed function
const runSeed = async () => {
  await connectDB();
  await seedFinanceData();
};

runSeed();
