const Invoice = require('../models/Invoice');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

class InvoiceService {
  /**
   * Create invoice from template
   */
  static async createFromTemplate(templateId, clientId, projectId, customData, createdBy) {
    try {
      const templates = {
        service: {
          items: [{
            description: 'Consulting Services',
            quantity: 1,
            unitPrice: customData.hourlyRate || 1000,
            taxRate: 18
          }],
          paymentTerms: 'net_30',
          notes: 'Thank you for your business!'
        },
        product: {
          items: [{
            description: customData.productName || 'Product',
            quantity: customData.quantity || 1,
            unitPrice: customData.price || 1000,
            taxRate: 18
          }],
          paymentTerms: 'net_15',
          notes: 'Please allow 3-5 business days for delivery.'
        },
        subscription: {
          items: [{
            description: `${customData.planName || 'Monthly'} Subscription`,
            quantity: 1,
            unitPrice: customData.amount || 999,
            taxRate: 18
          }],
          paymentTerms: 'immediate',
          notes: 'Subscription will auto-renew unless cancelled.',
          isRecurring: true,
          recurringSettings: {
            frequency: 'monthly',
            nextInvoiceDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        },
        project: {
          items: customData.milestones || [{
            description: 'Project Development',
            quantity: 1,
            unitPrice: customData.projectValue || 50000,
            taxRate: 18
          }],
          paymentTerms: 'net_30',
          notes: 'Payment terms as per project agreement.'
        }
      };

      const template = templates[templateId];
      if (!template) {
        throw new Error('Invalid template ID');
      }

      // Get client details
      const client = await User.findById(clientId);
      if (!client) {
        throw new Error('Client not found');
      }

      const invoiceData = {
        client: clientId,
        project: projectId,
        clientDetails: {
          name: `${client.firstName} ${client.lastName}`,
          email: client.email,
          phone: client.phone,
          companyName: client.companyName || '',
          address: client.address || {}
        },
        items: template.items,
        paymentTerms: template.paymentTerms,
        notes: template.notes,
        isRecurring: template.isRecurring || false,
        recurringSettings: template.recurringSettings,
        createdBy
      };

      const invoice = new Invoice(invoiceData);
      await invoice.save();

      return invoice;
    } catch (error) {
      console.error('Error creating invoice from template:', error);
      throw error;
    }
  }

  /**
   * Generate recurring invoices
   */
  static async generateRecurringInvoices() {
    try {
      console.log('Generating recurring invoices...');
      
      const dueInvoices = await Invoice.findDueForRecurring();
      const generatedInvoices = [];

      for (const originalInvoice of dueInvoices) {
        try {
          // Create new invoice based on the recurring template
          const newInvoiceData = originalInvoice.toObject();
          delete newInvoiceData._id;
          delete newInvoiceData.invoiceNumber;
          delete newInvoiceData.sequenceNumber;
          delete newInvoiceData.createdAt;
          delete newInvoiceData.updatedAt;
          delete newInvoiceData.payments;
          delete newInvoiceData.pdf;
          delete newInvoiceData.sentAt;
          delete newInvoiceData.viewedAt;
          delete newInvoiceData.viewCount;

          // Update dates and status
          newInvoiceData.invoiceDate = new Date();
          newInvoiceData.status = 'draft';
          newInvoiceData.paymentStatus = 'unpaid';

          // Create new invoice
          const newInvoice = new Invoice(newInvoiceData);
          await newInvoice.save();

          // Update original invoice's next generation date
          const nextDate = this.calculateNextInvoiceDate(
            originalInvoice.recurringSettings.frequency,
            originalInvoice.recurringSettings.nextInvoiceDate
          );

          originalInvoice.recurringSettings.nextInvoiceDate = nextDate;
          originalInvoice.recurringSettings.generatedCount += 1;

          // Check if we've reached the total invoice limit
          if (originalInvoice.recurringSettings.totalInvoices && 
              originalInvoice.recurringSettings.generatedCount >= originalInvoice.recurringSettings.totalInvoices) {
            originalInvoice.isRecurring = false;
          }

          await originalInvoice.save();
          generatedInvoices.push(newInvoice);

          console.log(`Generated recurring invoice: ${newInvoice.invoiceNumber}`);
        } catch (error) {
          console.error(`Error generating recurring invoice for ${originalInvoice.invoiceNumber}:`, error);
        }
      }

      console.log(`Generated ${generatedInvoices.length} recurring invoices`);
      return generatedInvoices;
    } catch (error) {
      console.error('Error generating recurring invoices:', error);
      throw error;
    }
  }

  /**
   * Calculate next invoice date based on frequency
   */
  static calculateNextInvoiceDate(frequency, currentDate) {
    const next = new Date(currentDate);
    
    switch (frequency) {
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'quarterly':
        next.setMonth(next.getMonth() + 3);
        break;
      case 'yearly':
        next.setFullYear(next.getFullYear() + 1);
        break;
      default:
        next.setMonth(next.getMonth() + 1);
    }
    
    return next;
  }

  /**
   * Send invoice via email
   */
  static async sendInvoiceEmail(invoiceId, customMessage = '') {
    try {
      const invoice = await Invoice.findById(invoiceId)
        .populate('client', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email');

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // Create email transporter
      const transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      // Generate PDF attachment (simplified - in production you'd generate actual PDF)
      const pdfBuffer = await this.generateInvoicePDFBuffer(invoice);

      // Email content
      const subject = `Invoice ${invoice.invoiceNumber} from CreatorBase`;
      const htmlContent = this.generateInvoiceEmailHTML(invoice, customMessage);

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@creatorbase.com',
        to: invoice.client.email,
        cc: invoice.createdBy.email,
        subject,
        html: htmlContent,
        attachments: [{
          filename: `invoice-${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }]
      };

      await transporter.sendMail(mailOptions);

      // Update invoice status
      await invoice.markAsSent();

      console.log(`Invoice ${invoice.invoiceNumber} sent to ${invoice.client.email}`);
      return true;
    } catch (error) {
      console.error('Error sending invoice email:', error);
      throw error;
    }
  }

  /**
   * Generate invoice email HTML
   */
  static generateInvoiceEmailHTML(invoice, customMessage) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .invoice-details { background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .button { display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 14px; color: #6c757d; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>CreatorBase</h1>
            <h2>Invoice ${invoice.invoiceNumber}</h2>
          </div>
          
          <p>Dear ${invoice.client.firstName},</p>
          
          <p>Please find attached your invoice for the services provided.</p>
          
          ${customMessage ? `<p><strong>Message:</strong> ${customMessage}</p>` : ''}
          
          <div class="invoice-details">
            <h3>Invoice Details:</h3>
            <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>Invoice Date:</strong> ${invoice.invoiceDate.toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> ${invoice.dueDate.toLocaleDateString()}</p>
            <p><strong>Amount:</strong> ₹${invoice.total.toFixed(2)}</p>
            <p><strong>Status:</strong> ${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</p>
          </div>
          
          <a href="${process.env.FRONTEND_URL}/invoices/${invoice._id}" class="button">
            View Invoice Online
          </a>
          
          <p>If you have any questions about this invoice, please don't hesitate to contact us.</p>
          
          <div class="footer">
            <p>
              <strong>CreatorBase</strong><br>
              Email: billing@creatorbase.com<br>
              Phone: +91 98765 43210<br>
              Website: www.creatorbase.com
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate PDF buffer (simplified)
   */
  static async generateInvoicePDFBuffer(invoice) {
    // This is a simplified implementation
    // In production, you'd use the PDFKit library to generate actual PDF
    const pdfContent = `
      INVOICE #${invoice.invoiceNumber}
      
      Bill To: ${invoice.clientDetails.name}
      Email: ${invoice.clientDetails.email}
      
      Date: ${invoice.invoiceDate.toLocaleDateString()}
      Due Date: ${invoice.dueDate.toLocaleDateString()}
      
      Items:
      ${invoice.items.map(item => 
        `${item.description} - Qty: ${item.quantity} x ₹${item.unitPrice} = ₹${item.amount}`
      ).join('\n')}
      
      Subtotal: ₹${invoice.subtotal.toFixed(2)}
      Tax: ₹${invoice.taxTotal.toFixed(2)}
      Total: ₹${invoice.total.toFixed(2)}
      
      Terms: ${invoice.terms || 'Payment due within 30 days'}
      Notes: ${invoice.notes || 'Thank you for your business!'}
    `;
    
    return Buffer.from(pdfContent, 'utf8');
  }

  /**
   * Send payment reminders for overdue invoices
   */
  static async sendPaymentReminders() {
    try {
      console.log('Sending payment reminders...');
      
      const overdueInvoices = await Invoice.findOverdue();
      let remindersSent = 0;

      for (const invoice of overdueInvoices) {
        try {
          const daysOverdue = invoice.daysOverdue;
          let reminderType = '';
          
          // Send different reminders based on how overdue
          if (daysOverdue >= 1 && daysOverdue <= 7) {
            reminderType = 'gentle';
          } else if (daysOverdue >= 8 && daysOverdue <= 30) {
            reminderType = 'firm';
          } else if (daysOverdue > 30) {
            reminderType = 'final';
          }

          if (reminderType) {
            await this.sendPaymentReminderEmail(invoice, reminderType);
            remindersSent++;
          }
        } catch (error) {
          console.error(`Error sending reminder for invoice ${invoice.invoiceNumber}:`, error);
        }
      }

      console.log(`Sent ${remindersSent} payment reminders`);
      return remindersSent;
    } catch (error) {
      console.error('Error sending payment reminders:', error);
      throw error;
    }
  }

  /**
   * Send payment reminder email
   */
  static async sendPaymentReminderEmail(invoice, reminderType) {
    const messages = {
      gentle: {
        subject: `Friendly Reminder: Invoice ${invoice.invoiceNumber} Past Due`,
        message: 'This is a friendly reminder that your invoice is now past due. Please submit payment at your earliest convenience.'
      },
      firm: {
        subject: `Payment Required: Invoice ${invoice.invoiceNumber} - ${invoice.daysOverdue} Days Overdue`,
        message: 'Your invoice is significantly past due. Please submit payment immediately to avoid any service interruptions.'
      },
      final: {
        subject: `FINAL NOTICE: Invoice ${invoice.invoiceNumber} - ${invoice.daysOverdue} Days Overdue`,
        message: 'This is a final notice for your overdue invoice. Please contact us immediately to resolve this matter.'
      }
    };

    const reminder = messages[reminderType];
    
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const htmlContent = `
      <p>Dear ${invoice.client.firstName},</p>
      <p>${reminder.message}</p>
      <p><strong>Invoice Details:</strong></p>
      <ul>
        <li>Invoice Number: ${invoice.invoiceNumber}</li>
        <li>Original Due Date: ${invoice.dueDate.toLocaleDateString()}</li>
        <li>Amount Due: ₹${invoice.balanceDue.toFixed(2)}</li>
        <li>Days Overdue: ${invoice.daysOverdue}</li>
      </ul>
      <p>Please contact us if you have any questions or concerns.</p>
      <p>Best regards,<br>CreatorBase Billing Team</p>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'billing@creatorbase.com',
      to: invoice.client.email,
      subject: reminder.subject,
      html: htmlContent
    });
  }

  /**
   * Get invoice statistics for dashboard
   */
  static async getInvoiceStats(userId = null, dateRange = {}) {
    try {
      const filter = {};
      
      // Filter by user if provided (for user-specific stats)
      if (userId) {
        filter.client = userId;
      }
      
      // Date range filter
      if (dateRange.startDate || dateRange.endDate) {
        filter.invoiceDate = {};
        if (dateRange.startDate) filter.invoiceDate.$gte = new Date(dateRange.startDate);
        if (dateRange.endDate) filter.invoiceDate.$lte = new Date(dateRange.endDate);
      }

      const stats = await Invoice.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalInvoices: { $sum: 1 },
            totalAmount: { $sum: '$total' },
            paidAmount: { 
              $sum: { 
                $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$total', 0] 
              } 
            },
            pendingAmount: { 
              $sum: { 
                $cond: [{ $ne: ['$paymentStatus', 'paid'] }, '$total', 0] 
              } 
            },
            draftCount: { 
              $sum: { 
                $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] 
              } 
            },
            sentCount: { 
              $sum: { 
                $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] 
              } 
            },
            paidCount: { 
              $sum: { 
                $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] 
              } 
            },
            overdueCount: {
              $sum: {
                $cond: [
                  { 
                    $and: [
                      { $ne: ['$paymentStatus', 'paid'] },
                      { $lt: ['$dueDate', new Date()] }
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);

      return stats[0] || {
        totalInvoices: 0,
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        draftCount: 0,
        sentCount: 0,
        paidCount: 0,
        overdueCount: 0
      };
    } catch (error) {
      console.error('Error getting invoice stats:', error);
      throw error;
    }
  }
}

module.exports = InvoiceService;
