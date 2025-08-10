const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getAllBudgets,
  createBudget,
  updateBudget,
  getAllInvoices,
  createInvoice,
  updateInvoiceStatus,
  getFinancialDashboard,
  getFinancialReports
} = require('../controllers/financeController');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Validation middleware
const transactionValidation = [
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Type must be either income or expense'),
  body('category')
    .isIn([
      'youtube_adsense', 'paid_courses', 'client_projects', 'sponsorships', 
      'affiliate_income', 'freelance', 'consulting', 'other_income',
      'salary', 'marketing', 'saas_tools', 'freelancers', 'rent', 
      'utilities', 'office_supplies', 'travel', 'meals', 'misc'
    ])
    .withMessage('Please select a valid category'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Description must be between 1 and 500 characters'),
  body('paymentMethod')
    .isIn(['cash', 'upi', 'card', 'bank_transfer', 'paypal', 'stripe'])
    .withMessage('Please select a valid payment method'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date')
];

const budgetValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Budget name must be between 1 and 100 characters'),
  body('category')
    .isIn(['salary', 'marketing', 'saas_tools', 'freelancers', 'rent', 
           'utilities', 'office_supplies', 'travel', 'meals', 'misc'])
    .withMessage('Please select a valid category'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('period')
    .isIn(['monthly', 'quarterly', 'yearly'])
    .withMessage('Period must be monthly, quarterly, or yearly'),
  body('startDate')
    .isISO8601()
    .withMessage('Please provide a valid start date'),
  body('endDate')
    .isISO8601()
    .withMessage('Please provide a valid end date')
];

const invoiceValidation = [
  body('clientName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Client name must be between 1 and 100 characters'),
  body('clientEmail')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.description')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Item description must be between 1 and 200 characters'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('items.*.unitPrice')
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a positive number'),
  body('dueDate')
    .isISO8601()
    .withMessage('Please provide a valid due date')
];

// ==================== TRANSACTION ROUTES ====================

// Get all transactions
router.get('/transactions', getAllTransactions);

// Get transaction by ID
router.get('/transactions/:id', getTransactionById);

// Create transaction
router.post('/transactions', transactionValidation, createTransaction);

// Update transaction
router.put('/transactions/:id', transactionValidation, updateTransaction);

// Delete transaction
router.delete('/transactions/:id', deleteTransaction);

// ==================== BUDGET ROUTES ====================

// Get all budgets
router.get('/budgets', getAllBudgets);

// Create budget
router.post('/budgets', budgetValidation, createBudget);

// Update budget
router.put('/budgets/:id', budgetValidation, updateBudget);

// ==================== INVOICE ROUTES ====================

// Get all invoices
router.get('/invoices', getAllInvoices);

// Create invoice
router.post('/invoices', invoiceValidation, createInvoice);

// Update invoice status
router.put('/invoices/:id/status', updateInvoiceStatus);

// ==================== ANALYTICS ROUTES ====================

// Get financial dashboard
router.get('/dashboard', getFinancialDashboard);

// Get financial reports
router.get('/reports', getFinancialReports);

module.exports = router; 