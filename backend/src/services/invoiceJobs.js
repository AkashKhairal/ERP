const cron = require('node-cron');
const InvoiceService = require('./invoiceService');
const Invoice = require('../models/Invoice');

class InvoiceJobService {
  /**
   * Initialize all invoice-related scheduled jobs
   */
  static initializeJobs() {
    console.log('Initializing invoice scheduled jobs...');

    // Generate recurring invoices - Daily at 9:00 AM
    cron.schedule('0 9 * * *', async () => {
      try {
        console.log('Running recurring invoice generation job...');
        await InvoiceService.generateRecurringInvoices();
      } catch (error) {
        console.error('Error in recurring invoice generation job:', error);
      }
    });

    // Send payment reminders - Daily at 10:00 AM
    cron.schedule('0 10 * * *', async () => {
      try {
        console.log('Running payment reminder job...');
        await InvoiceService.sendPaymentReminders();
      } catch (error) {
        console.error('Error in payment reminder job:', error);
      }
    });

    // Update overdue invoices - Daily at 8:00 AM
    cron.schedule('0 8 * * *', async () => {
      try {
        console.log('Running overdue invoice update job...');
        await this.updateOverdueInvoices();
      } catch (error) {
        console.error('Error in overdue invoice update job:', error);
      }
    });

    // Clean up old draft invoices - Weekly on Sunday at 2:00 AM
    cron.schedule('0 2 * * 0', async () => {
      try {
        console.log('Running draft invoice cleanup job...');
        await this.cleanupOldDrafts();
      } catch (error) {
        console.error('Error in draft invoice cleanup job:', error);
      }
    });

    // Generate monthly invoice reports - First day of month at 6:00 AM
    cron.schedule('0 6 1 * *', async () => {
      try {
        console.log('Running monthly invoice report generation...');
        await this.generateMonthlyReports();
      } catch (error) {
        console.error('Error in monthly report generation job:', error);
      }
    });

    console.log('Invoice scheduled jobs initialized successfully');
  }

  /**
   * Update overdue invoice statuses
   */
  static async updateOverdueInvoices() {
    try {
      const result = await Invoice.updateMany(
        {
          paymentStatus: { $ne: 'paid' },
          status: { $ne: 'paid' },
          dueDate: { $lt: new Date() }
        },
        {
          $set: { status: 'overdue' }
        }
      );

      console.log(`Updated ${result.modifiedCount} invoices to overdue status`);
      return result.modifiedCount;
    } catch (error) {
      console.error('Error updating overdue invoices:', error);
      throw error;
    }
  }

  /**
   * Clean up old draft invoices (older than 30 days)
   */
  static async cleanupOldDrafts() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await Invoice.deleteMany({
        status: 'draft',
        createdAt: { $lt: thirtyDaysAgo }
      });

      console.log(`Cleaned up ${result.deletedCount} old draft invoices`);
      return result.deletedCount;
    } catch (error) {
      console.error('Error cleaning up old drafts:', error);
      throw error;
    }
  }

  /**
   * Generate monthly invoice reports
   */
  static async generateMonthlyReports() {
    try {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      const startOfMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
      const endOfMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);

      // Get monthly statistics
      const monthlyStats = await Invoice.aggregate([
        {
          $match: {
            invoiceDate: {
              $gte: startOfMonth,
              $lte: endOfMonth
            }
          }
        },
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
            },
            overdueCount: {
              $sum: {
                $cond: [
                  { $eq: ['$status', 'overdue'] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);

      // Get top clients by revenue
      const topClients = await Invoice.aggregate([
        {
          $match: {
            invoiceDate: {
              $gte: startOfMonth,
              $lte: endOfMonth
            },
            paymentStatus: 'paid'
          }
        },
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
      ]);

      const monthName = lastMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
      
      console.log(`Monthly Invoice Report for ${monthName}:`);
      console.log('Statistics:', monthlyStats[0] || {});
      console.log('Top Clients:', topClients.slice(0, 5));

      // Here you could send this report via email to administrators
      // await this.sendMonthlyReportEmail(monthlyStats[0], topClients, monthName);

      return {
        month: monthName,
        stats: monthlyStats[0] || {},
        topClients: topClients
      };
    } catch (error) {
      console.error('Error generating monthly reports:', error);
      throw error;
    }
  }

  /**
   * Send weekly overdue invoice notifications to administrators
   */
  static async sendWeeklyOverdueReport() {
    try {
      const overdueInvoices = await Invoice.findOverdue();
      
      if (overdueInvoices.length === 0) {
        console.log('No overdue invoices found');
        return;
      }

      const totalOverdueAmount = overdueInvoices.reduce((sum, invoice) => sum + invoice.balanceDue, 0);
      
      console.log(`Weekly Overdue Report:`);
      console.log(`- ${overdueInvoices.length} overdue invoices`);
      console.log(`- Total overdue amount: ₹${totalOverdueAmount.toFixed(2)}`);
      
      // Group by days overdue
      const overdueBreakdown = overdueInvoices.reduce((acc, invoice) => {
        const days = invoice.daysOverdue;
        let category;
        
        if (days <= 7) category = '1-7 days';
        else if (days <= 30) category = '8-30 days';
        else if (days <= 60) category = '31-60 days';
        else category = '60+ days';
        
        if (!acc[category]) {
          acc[category] = { count: 0, amount: 0 };
        }
        
        acc[category].count++;
        acc[category].amount += invoice.balanceDue;
        
        return acc;
      }, {});
      
      console.log('Breakdown by age:', overdueBreakdown);

      // Here you could send this report via email to administrators
      // await this.sendOverdueReportEmail(overdueInvoices, overdueBreakdown);

      return {
        totalCount: overdueInvoices.length,
        totalAmount: totalOverdueAmount,
        breakdown: overdueBreakdown
      };
    } catch (error) {
      console.error('Error generating weekly overdue report:', error);
      throw error;
    }
  }

  /**
   * Auto-generate invoices for active subscriptions
   * This could be integrated with subscription system
   */
  static async generateSubscriptionInvoices() {
    try {
      // This would integrate with your subscription system
      // For now, we'll just check for recurring invoices marked for subscription
      
      const subscriptionInvoices = await Invoice.find({
        isRecurring: true,
        'recurringSettings.frequency': 'monthly',
        'recurringSettings.nextInvoiceDate': { $lte: new Date() }
      }).populate('client');

      let generatedCount = 0;

      for (const recurringInvoice of subscriptionInvoices) {
        try {
          // Generate new invoice based on the template
          const newInvoiceData = recurringInvoice.toObject();
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

          // Update dates
          newInvoiceData.invoiceDate = new Date();
          newInvoiceData.status = 'draft';
          newInvoiceData.paymentStatus = 'unpaid';

          const newInvoice = new Invoice(newInvoiceData);
          await newInvoice.save();

          // Update next generation date
          const nextDate = new Date();
          nextDate.setMonth(nextDate.getMonth() + 1);
          
          recurringInvoice.recurringSettings.nextInvoiceDate = nextDate;
          recurringInvoice.recurringSettings.generatedCount += 1;
          
          await recurringInvoice.save();
          
          generatedCount++;
          console.log(`Generated subscription invoice: ${newInvoice.invoiceNumber}`);
        } catch (error) {
          console.error(`Error generating subscription invoice for ${recurringInvoice.invoiceNumber}:`, error);
        }
      }

      console.log(`Generated ${generatedCount} subscription invoices`);
      return generatedCount;
    } catch (error) {
      console.error('Error generating subscription invoices:', error);
      throw error;
    }
  }

  /**
   * Process failed payment retries
   */
  static async processFailedPaymentRetries() {
    try {
      // Find invoices that are overdue and have been sent payment reminders
      const failedPaymentInvoices = await Invoice.find({
        status: 'overdue',
        paymentStatus: 'unpaid',
        dueDate: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // 7 days overdue
      }).populate('client');

      for (const invoice of failedPaymentInvoices) {
        try {
          // Check if this is a subscription invoice that should be cancelled
          if (invoice.isRecurring && invoice.daysOverdue > 30) {
            // Cancel subscription after 30 days
            invoice.status = 'cancelled';
            await invoice.save();
            
            console.log(`Cancelled subscription invoice: ${invoice.invoiceNumber}`);
            
            // Here you would also cancel the related subscription
            // await cancelSubscription(invoice.client._id);
          }
        } catch (error) {
          console.error(`Error processing failed payment for ${invoice.invoiceNumber}:`, error);
        }
      }

      return failedPaymentInvoices.length;
    } catch (error) {
      console.error('Error processing failed payment retries:', error);
      throw error;
    }
  }
}

module.exports = InvoiceJobService;
