import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only logout if it's a real authentication error, not just missing data
      if (error.response?.data?.message?.includes('token') || 
          error.response?.data?.message?.includes('authorized')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ==================== TRANSACTION SERVICES ====================

/**
 * Get all transactions with optional filters
 * @param {Object} filters - Query parameters for filtering
 * @returns {Promise} - Promise with transactions data
 */
export const getTransactions = async (filters = {}) => {
  try {
    const response = await api.get('/finance/transactions', { params: filters });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch transactions');
  }
};

/**
 * Get transaction by ID
 * @param {string} id - Transaction ID
 * @returns {Promise} - Promise with transaction data
 */
export const getTransactionById = async (id) => {
  try {
    const response = await api.get(`/finance/transactions/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch transaction');
  }
};

/**
 * Create new transaction
 * @param {Object} transactionData - Transaction data
 * @returns {Promise} - Promise with created transaction
 */
export const createTransaction = async (transactionData) => {
  try {
    const response = await api.post('/finance/transactions', transactionData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create transaction');
  }
};

/**
 * Update transaction
 * @param {string} id - Transaction ID
 * @param {Object} transactionData - Updated transaction data
 * @returns {Promise} - Promise with updated transaction
 */
export const updateTransaction = async (id, transactionData) => {
  try {
    const response = await api.put(`/finance/transactions/${id}`, transactionData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update transaction');
  }
};

/**
 * Delete transaction
 * @param {string} id - Transaction ID
 * @returns {Promise} - Promise with deletion result
 */
export const deleteTransaction = async (id) => {
  try {
    const response = await api.delete(`/finance/transactions/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete transaction');
  }
};

// ==================== BUDGET SERVICES ====================

/**
 * Get all budgets with optional filters
 * @param {Object} filters - Query parameters for filtering
 * @returns {Promise} - Promise with budgets data
 */
export const getBudgets = async (filters = {}) => {
  try {
    const response = await api.get('/finance/budgets', { params: filters });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch budgets');
  }
};

/**
 * Create new budget
 * @param {Object} budgetData - Budget data
 * @returns {Promise} - Promise with created budget
 */
export const createBudget = async (budgetData) => {
  try {
    const response = await api.post('/finance/budgets', budgetData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create budget');
  }
};

/**
 * Update budget
 * @param {string} id - Budget ID
 * @param {Object} budgetData - Updated budget data
 * @returns {Promise} - Promise with updated budget
 */
export const updateBudget = async (id, budgetData) => {
  try {
    const response = await api.put(`/finance/budgets/${id}`, budgetData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update budget');
  }
};

// ==================== INVOICE SERVICES ====================

/**
 * Get all invoices with optional filters
 * @param {Object} filters - Query parameters for filtering
 * @returns {Promise} - Promise with invoices data
 */
export const getInvoices = async (filters = {}) => {
  try {
    const response = await api.get('/finance/invoices', { params: filters });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch invoices');
  }
};

/**
 * Create new invoice
 * @param {Object} invoiceData - Invoice data
 * @returns {Promise} - Promise with created invoice
 */
export const createInvoice = async (invoiceData) => {
  try {
    const response = await api.post('/finance/invoices', invoiceData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create invoice');
  }
};

/**
 * Update invoice status
 * @param {string} id - Invoice ID
 * @param {string} status - New status
 * @returns {Promise} - Promise with updated invoice
 */
export const updateInvoiceStatus = async (id, status) => {
  try {
    const response = await api.put(`/finance/invoices/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update invoice status');
  }
};

// ==================== ANALYTICS SERVICES ====================

/**
 * Get financial dashboard data
 * @param {Object} filters - Query parameters for filtering
 * @returns {Promise} - Promise with dashboard data
 */
export const getFinancialDashboard = async (filters = {}) => {
  try {
    const response = await api.get('/finance/dashboard', { params: filters });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch dashboard data');
  }
};

/**
 * Get financial reports
 * @param {Object} filters - Query parameters for filtering
 * @returns {Promise} - Promise with reports data
 */
export const getFinancialReports = async (filters = {}) => {
  try {
    const response = await api.get('/finance/reports', { params: filters });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch reports');
  }
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'INR')
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Calculate percentage change
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {number} - Percentage change
 */
export const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Get transaction categories for income
 * @returns {Array} - Array of income categories
 */
export const getIncomeCategories = () => [
  { value: 'youtube_adsense', label: 'YouTube AdSense' },
  { value: 'paid_courses', label: 'Paid Courses' },
  { value: 'client_projects', label: 'Client Projects' },
  { value: 'sponsorships', label: 'Sponsorships' },
  { value: 'affiliate_income', label: 'Affiliate Income' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'other_income', label: 'Other Income' }
];

/**
 * Get transaction categories for expenses
 * @returns {Array} - Array of expense categories
 */
export const getExpenseCategories = () => [
  { value: 'salary', label: 'Salary' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'saas_tools', label: 'SaaS Tools' },
  { value: 'freelancers', label: 'Freelancers' },
  { value: 'rent', label: 'Rent' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'office_supplies', label: 'Office Supplies' },
  { value: 'travel', label: 'Travel' },
  { value: 'meals', label: 'Meals' },
  { value: 'misc', label: 'Miscellaneous' }
];

/**
 * Get payment methods
 * @returns {Array} - Array of payment methods
 */
export const getPaymentMethods = () => [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'stripe', label: 'Stripe' }
];

/**
 * Get budget periods
 * @returns {Array} - Array of budget periods
 */
export const getBudgetPeriods = () => [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' }
];

/**
 * Get invoice statuses
 * @returns {Array} - Array of invoice statuses
 */
export const getInvoiceStatuses = () => [
  { value: 'draft', label: 'Draft', color: 'gray' },
  { value: 'sent', label: 'Sent', color: 'blue' },
  { value: 'paid', label: 'Paid', color: 'green' },
  { value: 'overdue', label: 'Overdue', color: 'red' },
  { value: 'cancelled', label: 'Cancelled', color: 'gray' }
];

/**
 * Get status color for UI
 * @param {string} status - Status value
 * @returns {string} - CSS color class
 */
export const getStatusColor = (status) => {
  const statusColors = {
    draft: 'text-gray-600 bg-gray-100',
    sent: 'text-blue-600 bg-blue-100',
    paid: 'text-green-600 bg-green-100',
    overdue: 'text-red-600 bg-red-100',
    cancelled: 'text-gray-600 bg-gray-100',
    pending: 'text-yellow-600 bg-yellow-100',
    completed: 'text-green-600 bg-green-100',
    failed: 'text-red-600 bg-red-100'
  };
  return statusColors[status] || 'text-gray-600 bg-gray-100';
};

/**
 * Get transaction type color for UI
 * @param {string} type - Transaction type
 * @returns {string} - CSS color class
 */
export const getTransactionTypeColor = (type) => {
  return type === 'income' 
    ? 'text-green-600 bg-green-100' 
    : 'text-red-600 bg-red-100';
};

/**
 * Export transactions to CSV
 * @param {Array} transactions - Array of transactions
 * @param {string} filename - Filename for download
 */
export const exportTransactionsToCSV = (transactions, filename = 'transactions.csv') => {
  const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Payment Method', 'Status'];
  const csvContent = [
    headers.join(','),
    ...transactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.type,
      t.category,
      `"${t.description}"`,
      t.amount,
      t.paymentMethod,
      t.status
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

const financeService = {
  // Transaction services
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  
  // Budget services
  getBudgets,
  createBudget,
  updateBudget,
  
  // Invoice services
  getInvoices,
  createInvoice,
  updateInvoiceStatus,
  
  // Dashboard and reports
  getFinancialDashboard,
  getFinancialReports,
  
  // Utility functions
  formatCurrency,
  calculatePercentageChange,
  getIncomeCategories,
  getExpenseCategories,
  getPaymentMethods,
  getBudgetPeriods,
  getInvoiceStatuses,
  getStatusColor,
  getTransactionTypeColor,
  exportTransactionsToCSV
};

export default financeService; 