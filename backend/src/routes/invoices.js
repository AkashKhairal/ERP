const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();

// Import controllers
const {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  addPayment,
  generatePDF,
  sendInvoice,
  duplicateInvoice,
  getInvoiceAnalytics
} = require('../controllers/invoiceController');

// Import middleware
const { protect, authorize } = require('../middleware/auth');

// Validation middleware
const validateInvoiceCreation = [
  body('client')
    .isMongoId()
    .withMessage('Valid client ID is required'),
  body('invoiceDate')
    .optional()
    .isISO8601()
    .withMessage('Invoice date must be a valid date'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.description')
    .notEmpty()
    .withMessage('Item description is required'),
  body('items.*.quantity')
    .isFloat({ min: 0 })
    .withMessage('Item quantity must be a positive number'),
  body('items.*.unitPrice')
    .isFloat({ min: 0 })
    .withMessage('Item unit price must be a positive number'),
  body('currency')
    .optional()
    .isIn(['INR', 'USD', 'EUR', 'GBP'])
    .withMessage('Currency must be one of: INR, USD, EUR, GBP'),
  body('paymentTerms')
    .optional()
    .isIn(['immediate', 'net_15', 'net_30', 'net_45', 'net_60', 'custom'])
    .withMessage('Invalid payment terms'),
  body('discountType')
    .optional()
    .isIn(['percentage', 'fixed'])
    .withMessage('Discount type must be percentage or fixed'),
  body('discountValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount value must be a positive number')
];

const validateInvoiceUpdate = [
  param('id')
    .isMongoId()
    .withMessage('Valid invoice ID is required'),
  ...validateInvoiceCreation.slice(1) // Exclude client validation for updates
];

const validatePaymentAddition = [
  param('id')
    .isMongoId()
    .withMessage('Valid invoice ID is required'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Payment amount must be greater than 0'),
  body('paymentMethod')
    .isIn(['cash', 'bank_transfer', 'card', 'upi', 'cheque', 'other'])
    .withMessage('Invalid payment method'),
  body('paymentDate')
    .optional()
    .isISO8601()
    .withMessage('Payment date must be a valid date'),
  body('reference')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Reference must be a string with max 100 characters')
];

const validateMongoId = [
  param('id')
    .isMongoId()
    .withMessage('Valid invoice ID is required')
];

const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
];

// Apply authentication to all routes
router.use(protect);

// ==================== INVOICE CRUD ROUTES ====================

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private
router.get('/', 
  validateDateRange,
  getInvoices
);

// @desc    Get invoice analytics
// @route   GET /api/invoices/analytics
// @access  Private (Admin/Manager)
router.get('/analytics',
  authorize('admin', 'manager', 'finance_manager'),
  validateDateRange,
  getInvoiceAnalytics
);

// @desc    Create new invoice
// @route   POST /api/invoices
// @access  Private
router.post('/',
  validateInvoiceCreation,
  createInvoice
);

// @desc    Get single invoice
// @route   GET /api/invoices/:id
// @access  Private
router.get('/:id',
  validateMongoId,
  getInvoice
);

// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Private
router.put('/:id',
  validateInvoiceUpdate,
  updateInvoice
);

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private
router.delete('/:id',
  validateMongoId,
  deleteInvoice
);

// ==================== PAYMENT ROUTES ====================

// @desc    Add payment to invoice
// @route   POST /api/invoices/:id/payments
// @access  Private
router.post('/:id/payments',
  validatePaymentAddition,
  addPayment
);

// ==================== INVOICE ACTION ROUTES ====================

// @desc    Generate PDF for invoice
// @route   GET /api/invoices/:id/pdf
// @access  Private
router.get('/:id/pdf',
  validateMongoId,
  generatePDF
);

// @desc    Send invoice to client
// @route   POST /api/invoices/:id/send
// @access  Private
router.post('/:id/send',
  validateMongoId,
  sendInvoice
);

// @desc    Duplicate invoice
// @route   POST /api/invoices/:id/duplicate
// @access  Private
router.post('/:id/duplicate',
  validateMongoId,
  duplicateInvoice
);

// ==================== REPORTING ROUTES ====================

// @desc    Get overdue invoices
// @route   GET /api/invoices/reports/overdue
// @access  Private (Admin/Manager)
router.get('/reports/overdue',
  authorize('admin', 'manager', 'finance_manager'),
  async (req, res) => {
    try {
      const Invoice = require('../models/Invoice');
      const overdueInvoices = await Invoice.findOverdue();
      
      const totalOverdue = overdueInvoices.reduce((sum, invoice) => sum + invoice.balanceDue, 0);
      
      res.status(200).json({
        success: true,
        count: overdueInvoices.length,
        totalAmount: totalOverdue,
        data: overdueInvoices
      });
    } catch (error) {
      console.error('Error fetching overdue invoices:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching overdue invoices'
      });
    }
  }
);

// @desc    Get revenue report for period
// @route   GET /api/invoices/reports/revenue
// @access  Private (Admin/Manager)
router.get('/reports/revenue',
  authorize('admin', 'manager', 'finance_manager'),
  validateDateRange,
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1)); // First day of current month
      const end = endDate ? new Date(endDate) : new Date(); // Today
      
      const Invoice = require('../models/Invoice');
      const revenue = await Invoice.getRevenueForPeriod(start, end);
      
      res.status(200).json({
        success: true,
        period: { startDate: start, endDate: end },
        data: revenue[0] || { totalRevenue: 0, invoiceCount: 0, averageInvoiceValue: 0 }
      });
    } catch (error) {
      console.error('Error fetching revenue report:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching revenue report'
      });
    }
  }
);

// @desc    Get client invoices
// @route   GET /api/invoices/client/:clientId
// @access  Private
router.get('/client/:clientId',
  param('clientId').isMongoId().withMessage('Valid client ID is required'),
  async (req, res) => {
    try {
      const { clientId } = req.params;
      const { 
        status, 
        paymentStatus, 
        page = 1, 
        limit = 20,
        sortBy = 'createdAt',
        order = 'desc'
      } = req.query;

      const filter = { client: clientId };
      if (status) filter.status = status;
      if (paymentStatus) filter.paymentStatus = paymentStatus;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const Invoice = require('../models/Invoice');
      const invoices = await Invoice.find(filter)
        .populate('project', 'name description')
        .populate('createdBy', 'firstName lastName')
        .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Invoice.countDocuments(filter);

      // Calculate client summary
      const summary = await Invoice.aggregate([
        { $match: { client: mongoose.Types.ObjectId(clientId) } },
        {
          $group: {
            _id: null,
            totalInvoices: { $sum: 1 },
            totalAmount: { $sum: '$total' },
            paidAmount: { 
              $sum: { 
                $cond: [
                  { $eq: ['$paymentStatus', 'paid'] }, 
                  '$total', 
                  0
                ] 
              } 
            },
            pendingAmount: { 
              $sum: { 
                $cond: [
                  { $ne: ['$paymentStatus', 'paid'] }, 
                  '$total', 
                  0
                ] 
              } 
            }
          }
        }
      ]);

      res.status(200).json({
        success: true,
        count: invoices.length,
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        summary: summary[0] || { totalInvoices: 0, totalAmount: 0, paidAmount: 0, pendingAmount: 0 },
        data: invoices
      });
    } catch (error) {
      console.error('Error fetching client invoices:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching client invoices'
      });
    }
  }
);

// @desc    Get invoice templates
// @route   GET /api/invoices/templates
// @access  Private
router.get('/templates',
  async (req, res) => {
    try {
      // Return predefined invoice templates
      const templates = [
        {
          id: 'service',
          name: 'Service Invoice',
          description: 'For service-based billing',
          items: [
            {
              description: 'Consulting Services',
              quantity: 1,
              unitPrice: 0,
              taxRate: 18
            }
          ]
        },
        {
          id: 'product',
          name: 'Product Invoice',
          description: 'For product sales',
          items: [
            {
              description: 'Product Name',
              quantity: 1,
              unitPrice: 0,
              taxRate: 18
            }
          ]
        },
        {
          id: 'subscription',
          name: 'Subscription Invoice',
          description: 'For recurring subscriptions',
          items: [
            {
              description: 'Monthly Subscription',
              quantity: 1,
              unitPrice: 0,
              taxRate: 18
            }
          ]
        },
        {
          id: 'project',
          name: 'Project Invoice',
          description: 'For project-based work',
          items: [
            {
              description: 'Project Development',
              quantity: 1,
              unitPrice: 0,
              taxRate: 18
            }
          ]
        }
      ];

      res.status(200).json({
        success: true,
        data: templates
      });
    } catch (error) {
      console.error('Error fetching invoice templates:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching invoice templates'
      });
    }
  }
);

module.exports = router;
