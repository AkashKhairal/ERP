import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
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
      // Only logout if it's a real authentication error
      if (error.response?.data?.message?.includes('token') || 
          error.response?.data?.message?.includes('authorized')) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// ==================== INTERFACES ====================

export interface Transaction {
  _id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'cancelled' | 'failed';
  receipt?: string;
  linkedProject?: {
    _id: string;
    name: string;
  };
  linkedEmployee?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  tags: string[];
  notes?: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  _id: string;
  name: string;
  category: string;
  amount: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientAddress?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paymentDate?: string;
  notes?: string;
  linkedProject?: {
    _id: string;
    name: string;
  };
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface DashboardData {
  summary: {
    currentMonth: {
      income: number;
      expenses: number;
      profit: number;
      profitMargin: number;
    };
    changes: {
      incomeChange: number;
      expenseChange: number;
      profitChange: number;
    };
    invoices: {
      pending: number;
      overdue: number;
      totalReceivables: number;
      totalOverdue: number;
    };
  };
  charts: {
    monthlyTrends: Array<{
      month: string;
      income: number;
      expenses: number;
      profit: number;
    }>;
    expenseByCategory: Array<{
      category: string;
      amount: number;
      count: number;
    }>;
    incomeByCategory: Array<{
      category: string;
      amount: number;
      count: number;
    }>;
  };
  budgetVsActual: Array<{
    category: string;
    budget: number;
    actual: number;
    remaining: number;
    percentage: number;
    status: 'good' | 'warning' | 'over';
  }>;
  recentTransactions: Transaction[];
  overdueInvoices: Invoice[];
  invoiceStats: Array<{
    status: string;
    count: number;
    total: number;
  }>;
}

// ==================== TRANSACTION SERVICES ====================

export const getTransactions = async (filters: any = {}): Promise<{ success: boolean; data: Transaction[] }> => {
  try {
    const response = await api.get('/finance/transactions', { params: filters });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch transactions');
  }
};

export const getTransactionById = async (id: string): Promise<{ success: boolean; data: Transaction }> => {
  try {
    const response = await api.get(`/finance/transactions/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch transaction');
  }
};

export const createTransaction = async (transactionData: Partial<Transaction>): Promise<{ success: boolean; data: Transaction }> => {
  try {
    const response = await api.post('/finance/transactions', transactionData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create transaction');
  }
};

export const updateTransaction = async (id: string, transactionData: Partial<Transaction>): Promise<{ success: boolean; data: Transaction }> => {
  try {
    const response = await api.put(`/finance/transactions/${id}`, transactionData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update transaction');
  }
};

export const deleteTransaction = async (id: string): Promise<{ success: boolean }> => {
  try {
    const response = await api.delete(`/finance/transactions/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete transaction');
  }
};

// ==================== BUDGET SERVICES ====================

export const getBudgets = async (filters: any = {}): Promise<{ success: boolean; data: Budget[] }> => {
  try {
    const response = await api.get('/finance/budgets', { params: filters });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch budgets');
  }
};

export const createBudget = async (budgetData: Partial<Budget>): Promise<{ success: boolean; data: Budget }> => {
  try {
    const response = await api.post('/finance/budgets', budgetData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create budget');
  }
};

export const updateBudget = async (id: string, budgetData: Partial<Budget>): Promise<{ success: boolean; data: Budget }> => {
  try {
    const response = await api.put(`/finance/budgets/${id}`, budgetData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update budget');
  }
};

// ==================== INVOICE SERVICES ====================

export const getInvoices = async (filters: any = {}): Promise<{ success: boolean; data: Invoice[] }> => {
  try {
    const response = await api.get('/finance/invoices', { params: filters });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch invoices');
  }
};

export const createInvoice = async (invoiceData: Partial<Invoice>): Promise<{ success: boolean; data: Invoice }> => {
  try {
    const response = await api.post('/finance/invoices', invoiceData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create invoice');
  }
};

export const updateInvoiceStatus = async (id: string, status: string): Promise<{ success: boolean; data: Invoice }> => {
  try {
    const response = await api.put(`/finance/invoices/${id}/status`, { status });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update invoice status');
  }
};

// ==================== ANALYTICS SERVICES ====================

export const getFinancialDashboard = async (filters: any = {}): Promise<{ success: boolean; data: DashboardData }> => {
  try {
    const response = await api.get('/finance/dashboard', { params: filters });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch dashboard data');
  }
};

export const getFinancialReports = async (filters: any = {}): Promise<{ success: boolean; data: any }> => {
  try {
    const response = await api.get('/finance/reports', { params: filters });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch reports');
  }
};

// ==================== UTILITY FUNCTIONS ====================

export const formatCurrency = (amount: number, currency = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

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

export const getPaymentMethods = () => [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'stripe', label: 'Stripe' }
];

export const getBudgetPeriods = () => [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' }
];

export const getInvoiceStatuses = () => [
  { value: 'draft', label: 'Draft', color: 'gray' },
  { value: 'sent', label: 'Sent', color: 'blue' },
  { value: 'paid', label: 'Paid', color: 'green' },
  { value: 'overdue', label: 'Overdue', color: 'red' },
  { value: 'cancelled', label: 'Cancelled', color: 'gray' }
];

export const getStatusColor = (status: string): string => {
  const statusColors: { [key: string]: string } = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800'
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

export const exportTransactionsToCSV = (transactions: Transaction[], filename = 'transactions.csv'): void => {
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
