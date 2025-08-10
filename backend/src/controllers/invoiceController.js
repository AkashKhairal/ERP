const Invoice = require('../models/Invoice');
const User = require('../models/User');
const Project = require('../models/Project');
const { validationResult } = require('express-validator');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// ==================== INVOICE CRUD OPERATIONS ====================

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private
const getInvoices = async (req, res) => {
  try {
    const {
      status,
      paymentStatus,
      client,
      project,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc',
      startDate,
      endDate
    } = req.query;

    const filter = {};
    
    // Add filters
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (client) filter.client = client;
    if (project) filter.project = project;
    
    // Date range filter
    if (startDate || endDate) {
      filter.invoiceDate = {};
      if (startDate) filter.invoiceDate.$gte = new Date(startDate);
      if (endDate) filter.invoiceDate.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const invoices = await Invoice.find(filter)
      .populate('client', 'firstName lastName email companyName')
      .populate('project', 'name description')
      .populate('createdBy', 'firstName lastName')
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Invoice.countDocuments(filter);

    // Calculate summary statistics
    const stats = await Invoice.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
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
          },
          overdueCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $ne: ['$paymentStatus', 'paid'] },
                  { $lt: ['$dueDate', new Date()] }
                ]},
                1,
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
      stats: stats[0] || { totalAmount: 0, paidAmount: 0, pendingAmount: 0, overdueCount: 0 },
      data: invoices
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching invoices'
    });
  }
};

// @desc    Get single invoice
// @route   GET /api/invoices/:id
// @access  Private
const getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('client', 'firstName lastName email phone companyName')
      .populate('project', 'name description')
      .populate('createdBy updatedBy', 'firstName lastName email')
      .populate('payments.recordedBy', 'firstName lastName');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Record view if accessed by client
    if (req.user.id === invoice.client._id.toString()) {
      await invoice.recordView();
    }

    res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching invoice'
    });
  }
};

// @desc    Create new invoice
// @route   POST /api/invoices
// @access  Private
const createInvoice = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const invoiceData = {
      ...req.body,
      createdBy: req.user.id
    };

    // Populate client details if not provided
    if (!invoiceData.clientDetails && invoiceData.client) {
      const client = await User.findById(invoiceData.client);
      if (client) {
        invoiceData.clientDetails = {
          name: `${client.firstName} ${client.lastName}`,
          email: client.email,
          phone: client.phone,
          companyName: client.companyName || '',
          address: client.address || {}
        };
      }
    }

    const invoice = new Invoice(invoiceData);
    await invoice.save();

    // Populate the created invoice
    await invoice.populate([
      { path: 'client', select: 'firstName lastName email' },
      { path: 'project', select: 'name description' },
      { path: 'createdBy', select: 'firstName lastName' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating invoice'
    });
  }
};

// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Private
const updateInvoice = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Prevent editing paid invoices
    if (invoice.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit paid invoices'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'invoiceNumber' && key !== 'sequenceNumber') {
        invoice[key] = req.body[key];
      }
    });

    invoice.updatedBy = req.user.id;
    await invoice.save();

    await invoice.populate([
      { path: 'client', select: 'firstName lastName email' },
      { path: 'project', select: 'name description' },
      { path: 'createdBy updatedBy', select: 'firstName lastName' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Invoice updated successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating invoice'
    });
  }
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private
const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Prevent deleting paid invoices
    if (invoice.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete paid invoices'
      });
    }

    await invoice.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting invoice'
    });
  }
};

// ==================== PAYMENT OPERATIONS ====================

// @desc    Add payment to invoice
// @route   POST /api/invoices/:id/payments
// @access  Private
const addPayment = async (req, res) => {
  try {
    const { amount, paymentDate, paymentMethod, reference, notes } = req.body;

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Validate payment amount
    const balanceDue = invoice.balanceDue;
    if (amount > balanceDue) {
      return res.status(400).json({
        success: false,
        message: `Payment amount cannot exceed balance due (${balanceDue})`
      });
    }

    await invoice.addPayment({
      amount,
      date: paymentDate,
      method: paymentMethod,
      reference,
      notes,
      recordedBy: req.user.id
    });

    await invoice.populate([
      { path: 'client', select: 'firstName lastName email' },
      { path: 'payments.recordedBy', select: 'firstName lastName' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Payment added successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Error adding payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding payment'
    });
  }
};

// ==================== PDF GENERATION ====================

// @desc    Generate PDF for invoice
// @route   GET /api/invoices/:id/pdf
// @access  Private
const generatePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('client', 'firstName lastName email phone companyName')
      .populate('project', 'name description')
      .populate('createdBy', 'firstName lastName email');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`);
    
    // Pipe PDF to response
    doc.pipe(res);

    // Generate PDF content
    await generateInvoicePDF(doc, invoice);

    // Finalize PDF
    doc.end();

    // Update invoice with PDF info
    const pdfFilename = `invoice-${invoice.invoiceNumber}.pdf`;
    invoice.pdf = {
      filename: pdfFilename,
      generatedAt: new Date(),
      version: (invoice.pdf?.version || 0) + 1
    };
    await invoice.save();

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF'
    });
  }
};

// ==================== INVOICE ACTIONS ====================

// @desc    Send invoice
// @route   POST /api/invoices/:id/send
// @access  Private
const sendInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('client', 'firstName lastName email');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Mark as sent
    await invoice.markAsSent();

    // Here you would integrate with email service
    // For now, we'll just mark it as sent
    
    res.status(200).json({
      success: true,
      message: 'Invoice sent successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Error sending invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending invoice'
    });
  }
};

// @desc    Duplicate invoice
// @route   POST /api/invoices/:id/duplicate
// @access  Private
const duplicateInvoice = async (req, res) => {
  try {
    const originalInvoice = await Invoice.findById(req.params.id);

    if (!originalInvoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Create duplicate with new invoice number
    const duplicateData = originalInvoice.toObject();
    delete duplicateData._id;
    delete duplicateData.invoiceNumber;
    delete duplicateData.sequenceNumber;
    delete duplicateData.createdAt;
    delete duplicateData.updatedAt;
    delete duplicateData.payments;
    delete duplicateData.pdf;
    delete duplicateData.sentAt;
    delete duplicateData.viewedAt;
    delete duplicateData.viewCount;

    // Reset status and dates
    duplicateData.status = 'draft';
    duplicateData.paymentStatus = 'unpaid';
    duplicateData.invoiceDate = new Date();
    duplicateData.createdBy = req.user.id;

    const duplicate = new Invoice(duplicateData);
    await duplicate.save();

    await duplicate.populate([
      { path: 'client', select: 'firstName lastName email' },
      { path: 'project', select: 'name description' },
      { path: 'createdBy', select: 'firstName lastName' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Invoice duplicated successfully',
      data: duplicate
    });
  } catch (error) {
    console.error('Error duplicating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error duplicating invoice'
    });
  }
};

// ==================== REPORTING ====================

// @desc    Get invoice analytics
// @route   GET /api/invoices/analytics
// @access  Private
const getInvoiceAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.invoiceDate = {};
      if (startDate) dateFilter.invoiceDate.$gte = new Date(startDate);
      if (endDate) dateFilter.invoiceDate.$lte = new Date(endDate);
    }

    const [
      totalStats,
      statusBreakdown,
      monthlyRevenue,
      topClients,
      overdueInvoices
    ] = await Promise.all([
      // Total statistics
      Invoice.aggregate([
        { $match: dateFilter },
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
            averageInvoiceValue: { $avg: '$total' },
            averageDaysToPayment: {
              $avg: {
                $cond: [
                  { $eq: ['$paymentStatus', 'paid'] },
                  { $divide: [{ $subtract: ['$updatedAt', '$invoiceDate'] }, 86400000] },
                  null
                ]
              }
            }
          }
        }
      ]),

      // Status breakdown
      Invoice.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            amount: { $sum: '$total' }
          }
        }
      ]),

      // Monthly revenue trend
      Invoice.aggregate([
        { $match: { ...dateFilter, paymentStatus: 'paid' } },
        {
          $group: {
            _id: {
              year: { $year: '$invoiceDate' },
              month: { $month: '$invoiceDate' }
            },
            revenue: { $sum: '$total' },
            invoiceCount: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),

      // Top clients by revenue
      Invoice.aggregate([
        { $match: { ...dateFilter, paymentStatus: 'paid' } },
        {
          $group: {
            _id: '$client',
            totalRevenue: { $sum: '$total' },
            invoiceCount: { $sum: 1 }
          }
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'clientInfo'
          }
        },
        { $unwind: '$clientInfo' }
      ]),

      // Overdue invoices
      Invoice.find({
        paymentStatus: { $ne: 'paid' },
        dueDate: { $lt: new Date() }
      }).populate('client', 'firstName lastName email')
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: totalStats[0] || {},
        statusBreakdown,
        monthlyRevenue,
        topClients,
        overdueInvoices: {
          count: overdueInvoices.length,
          totalAmount: overdueInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0),
          invoices: overdueInvoices.slice(0, 10) // Limit to 10 for overview
        }
      }
    });
  } catch (error) {
    console.error('Error fetching invoice analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching invoice analytics'
    });
  }
};

// ==================== UTILITY FUNCTIONS ====================

// PDF Generation Helper
const generateInvoicePDF = async (doc, invoice) => {
  const companyInfo = {
    name: 'CreatorBase',
    address: '123 Business Street\nCity, State 12345\nIndia',
    email: 'billing@creatorbase.com',
    phone: '+91 98765 43210',
    website: 'www.creatorbase.com'
  };

  // Header
  doc.fontSize(20).text(companyInfo.name, 50, 50);
  doc.fontSize(10).text(companyInfo.address, 50, 80);
  doc.text(`Email: ${companyInfo.email}`, 50, 120);
  doc.text(`Phone: ${companyInfo.phone}`, 50, 135);

  // Invoice title and number
  doc.fontSize(24).text('INVOICE', 400, 50);
  doc.fontSize(12).text(`Invoice #: ${invoice.invoiceNumber}`, 400, 80);
  doc.text(`Date: ${invoice.invoiceDate.toLocaleDateString()}`, 400, 100);
  doc.text(`Due Date: ${invoice.dueDate.toLocaleDateString()}`, 400, 120);

  // Bill to section
  doc.fontSize(14).text('Bill To:', 50, 180);
  doc.fontSize(12);
  doc.text(invoice.clientDetails.name, 50, 200);
  if (invoice.clientDetails.companyName) {
    doc.text(invoice.clientDetails.companyName, 50, 220);
  }
  doc.text(invoice.clientDetails.email, 50, 240);
  if (invoice.clientDetails.phone) {
    doc.text(invoice.clientDetails.phone, 50, 260);
  }

  // Items table
  let yPosition = 320;
  doc.fontSize(12);
  
  // Table headers
  doc.text('Description', 50, yPosition);
  doc.text('Qty', 300, yPosition);
  doc.text('Rate', 350, yPosition);
  doc.text('Amount', 450, yPosition);
  
  // Draw line under headers
  yPosition += 20;
  doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
  yPosition += 10;

  // Items
  invoice.items.forEach(item => {
    doc.text(item.description, 50, yPosition);
    doc.text(item.quantity.toString(), 300, yPosition);
    doc.text(`₹${item.unitPrice.toFixed(2)}`, 350, yPosition);
    doc.text(`₹${item.amount.toFixed(2)}`, 450, yPosition);
    yPosition += 20;
  });

  // Totals
  yPosition += 20;
  const totalsX = 400;
  doc.text(`Subtotal: ₹${invoice.subtotal.toFixed(2)}`, totalsX, yPosition);
  yPosition += 20;
  
  if (invoice.taxTotal > 0) {
    doc.text(`Tax: ₹${invoice.taxTotal.toFixed(2)}`, totalsX, yPosition);
    yPosition += 20;
  }
  
  if (invoice.discountAmount > 0) {
    doc.text(`Discount: -₹${invoice.discountAmount.toFixed(2)}`, totalsX, yPosition);
    yPosition += 20;
  }
  
  doc.fontSize(14).text(`Total: ₹${invoice.total.toFixed(2)}`, totalsX, yPosition);

  // Payment terms and notes
  if (invoice.terms) {
    yPosition += 60;
    doc.fontSize(12).text('Terms & Conditions:', 50, yPosition);
    doc.fontSize(10).text(invoice.terms, 50, yPosition + 20, { width: 500 });
  }

  if (invoice.notes) {
    yPosition += 100;
    doc.fontSize(12).text('Notes:', 50, yPosition);
    doc.fontSize(10).text(invoice.notes, 50, yPosition + 20, { width: 500 });
  }
};

module.exports = {
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
};
