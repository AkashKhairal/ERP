const { Transaction, Budget, Invoice, TaxRecord } = require('../models/Finance');
const { validationResult } = require('express-validator');

// ==================== TRANSACTION CONTROLLERS ====================

// @desc    Get all transactions
// @route   GET /api/finance/transactions
// @access  Private
const getAllTransactions = async (req, res) => {
  try {
    const { type, category, startDate, endDate, status, page = 1, limit = 20 } = req.query;
    const query = {};

    // Build query filters
    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { date: -1 },
      populate: [
        { path: 'createdBy', select: 'firstName lastName email' },
        { path: 'linkedProject', select: 'name' },
        { path: 'linkedEmployee', select: 'firstName lastName' }
      ]
    };

    const transactions = await Transaction.paginate(query, options);

    res.json({
      success: true,
      data: transactions.docs,
      pagination: {
        page: transactions.page,
        totalPages: transactions.totalPages,
        totalDocs: transactions.totalDocs,
        hasNextPage: transactions.hasNextPage,
        hasPrevPage: transactions.hasPrevPage
      }
    });
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching transactions',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get transaction by ID
// @route   GET /api/finance/transactions/:id
// @access  Private
const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .populate('linkedProject', 'name')
      .populate('linkedEmployee', 'firstName lastName');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Get transaction by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching transaction',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Create new transaction
// @route   POST /api/finance/transactions
// @access  Private
const createTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const transactionData = {
      ...req.body,
      createdBy: req.user._id
    };

    const transaction = new Transaction(transactionData);
    await transaction.save();

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('createdBy', 'firstName lastName email')
      .populate('linkedProject', 'name')
      .populate('linkedEmployee', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: populatedTransaction
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating transaction',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Update transaction
// @route   PUT /api/finance/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      transaction[key] = req.body[key];
    });
    transaction.updatedBy = req.user._id;

    await transaction.save();

    const updatedTransaction = await Transaction.findById(transaction._id)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .populate('linkedProject', 'name')
      .populate('linkedEmployee', 'firstName lastName');

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: updatedTransaction
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating transaction',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Delete transaction
// @route   DELETE /api/finance/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    await Transaction.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting transaction',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// ==================== BUDGET CONTROLLERS ====================

// @desc    Get all budgets
// @route   GET /api/finance/budgets
// @access  Private
const getAllBudgets = async (req, res) => {
  try {
    const { category, period, isActive } = req.query;
    const query = {};

    if (category) query.category = category;
    if (period) query.period = period;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const budgets = await Budget.find(query)
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: budgets.length,
      data: budgets
    });
  } catch (error) {
    console.error('Get all budgets error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching budgets',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Create new budget
// @route   POST /api/finance/budgets
// @access  Private
const createBudget = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const budgetData = {
      ...req.body,
      createdBy: req.user._id
    };

    const budget = new Budget(budgetData);
    await budget.save();

    const populatedBudget = await Budget.findById(budget._id)
      .populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      data: populatedBudget
    });
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating budget',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Update budget
// @route   PUT /api/finance/budgets/:id
// @access  Private
const updateBudget = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    Object.keys(req.body).forEach(key => {
      budget[key] = req.body[key];
    });

    await budget.save();

    const updatedBudget = await Budget.findById(budget._id)
      .populate('createdBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Budget updated successfully',
      data: updatedBudget
    });
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating budget',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// ==================== INVOICE CONTROLLERS ====================

// @desc    Get all invoices
// @route   GET /api/finance/invoices
// @access  Private
const getAllInvoices = async (req, res) => {
  try {
    const { status, clientName, startDate, endDate, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (clientName) query.clientName = { $regex: clientName, $options: 'i' };
    if (startDate || endDate) {
      query.issueDate = {};
      if (startDate) query.issueDate.$gte = new Date(startDate);
      if (endDate) query.issueDate.$lte = new Date(endDate);
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { issueDate: -1 },
      populate: [
        { path: 'createdBy', select: 'firstName lastName email' },
        { path: 'linkedProject', select: 'name' }
      ]
    };

    const invoices = await Invoice.paginate(query, options);

    res.json({
      success: true,
      data: invoices.docs,
      pagination: {
        page: invoices.page,
        totalPages: invoices.totalPages,
        totalDocs: invoices.totalDocs,
        hasNextPage: invoices.hasNextPage,
        hasPrevPage: invoices.hasPrevPage
      }
    });
  } catch (error) {
    console.error('Get all invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching invoices',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Create new invoice
// @route   POST /api/finance/invoices
// @access  Private
const createInvoice = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const invoiceData = {
      ...req.body,
      createdBy: req.user._id
    };

    const invoice = new Invoice(invoiceData);
    await invoice.save();

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('createdBy', 'firstName lastName email')
      .populate('linkedProject', 'name');

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: populatedInvoice
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating invoice',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Update invoice status
// @route   PUT /api/finance/invoices/:id/status
// @access  Private
const updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    invoice.status = status;
    if (status === 'paid') {
      invoice.paymentDate = new Date();
    }

    await invoice.save();

    const updatedInvoice = await Invoice.findById(invoice._id)
      .populate('createdBy', 'firstName lastName email')
      .populate('linkedProject', 'name');

    res.json({
      success: true,
      message: 'Invoice status updated successfully',
      data: updatedInvoice
    });
  } catch (error) {
    console.error('Update invoice status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating invoice status',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// ==================== ANALYTICS CONTROLLERS ====================

// @desc    Get financial dashboard data
// @route   GET /api/finance/dashboard
// @access  Private
const getFinancialDashboard = async (req, res) => {
  try {
    const { year, month } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;

    // Get monthly stats
    const monthlyStats = await Transaction.getMonthlyStats(currentYear, currentMonth);
    
    // Calculate totals
    const income = monthlyStats.find(stat => stat._id === 'income')?.total || 0;
    const expenses = monthlyStats.find(stat => stat._id === 'expense')?.total || 0;
    const profit = income - expenses;

    // Get budget vs actual for current month
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);
    
    const budgetCategories = ['salary', 'marketing', 'saas_tools', 'freelancers', 'rent'];
    const budgetVsActual = [];

    for (const category of budgetCategories) {
      const budgetData = await Budget.getBudgetVsActual(category, startDate, endDate);
      budgetVsActual.push({
        category,
        budget: budgetData.budget,
        actual: budgetData.actual,
        remaining: budgetData.budget - budgetData.actual
      });
    }

    // Get recent transactions
    const recentTransactions = await Transaction.find()
      .sort({ date: -1 })
      .limit(10)
      .populate('createdBy', 'firstName lastName');

    // Get overdue invoices
    const overdueInvoices = await Invoice.find({
      status: 'sent',
      dueDate: { $lt: new Date() }
    })
    .populate('createdBy', 'firstName lastName')
    .limit(5);

    res.json({
      success: true,
      data: {
        summary: {
          income,
          expenses,
          profit,
          profitMargin: income > 0 ? (profit / income) * 100 : 0
        },
        budgetVsActual,
        recentTransactions,
        overdueInvoices
      }
    });
  } catch (error) {
    console.error('Get financial dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get financial reports
// @route   GET /api/finance/reports
// @access  Private
const getFinancialReports = async (req, res) => {
  try {
    const { type, startDate, endDate, format = 'json' } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    let reportData;

    switch (type) {
      case 'profit_loss':
        reportData = await Transaction.aggregate([
          {
            $match: {
              date: { $gte: start, $lte: end }
            }
          },
          {
            $group: {
              _id: {
                type: '$type',
                category: '$category'
              },
              total: { $sum: '$amount' },
              count: { $sum: 1 }
            }
          },
          {
            $group: {
              _id: '$_id.type',
              categories: {
                $push: {
                  category: '$_id.category',
                  total: '$total',
                  count: '$count'
                }
              },
              total: { $sum: '$total' }
            }
          }
        ]);
        break;

      case 'cash_flow':
        reportData = await Transaction.aggregate([
          {
            $match: {
              date: { $gte: start, $lte: end }
            }
          },
          {
            $group: {
              _id: {
                year: { $year: '$date' },
                month: { $month: '$date' },
                day: { $dayOfMonth: '$date' },
                type: '$type'
              },
              total: { $sum: '$amount' }
            }
          },
          {
            $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
          }
        ]);
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
    }

    res.json({
      success: true,
      data: reportData,
      metadata: {
        type,
        startDate: start,
        endDate: end,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Get financial reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating reports',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

module.exports = {
  // Transaction controllers
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  
  // Budget controllers
  getAllBudgets,
  createBudget,
  updateBudget,
  
  // Invoice controllers
  getAllInvoices,
  createInvoice,
  updateInvoiceStatus,
  
  // Analytics controllers
  getFinancialDashboard,
  getFinancialReports
}; 