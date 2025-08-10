import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxRate: number;
  taxAmount: number;
}

export interface ClientDetails {
  name: string;
  email: string;
  phone?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  taxId?: string;
  companyName?: string;
}

export interface Payment {
  amount: number;
  paymentDate: Date;
  paymentMethod: 'cash' | 'bank_transfer' | 'card' | 'upi' | 'cheque' | 'other';
  reference?: string;
  notes?: string;
  recordedBy?: string;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  series: string;
  sequenceNumber: number;
  client: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    companyName?: string;
  };
  clientDetails: ClientDetails;
  invoiceDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxTotal: number;
  discountAmount: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  total: number;
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'refunded';
  paymentTerms: 'immediate' | 'net_15' | 'net_30' | 'net_45' | 'net_60' | 'custom';
  customPaymentTerms?: string;
  payments: Payment[];
  notes?: string;
  terms?: string;
  internalNotes?: string;
  project?: {
    _id: string;
    name: string;
    description: string;
  };
  pdf?: {
    filename: string;
    url: string;
    generatedAt: string;
    version: number;
  };
  sentAt?: string;
  viewedAt?: string;
  viewCount: number;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  updatedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  isRecurring: boolean;
  recurringSettings?: {
    frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    nextInvoiceDate: string;
    endDate?: string;
    totalInvoices?: number;
    generatedCount: number;
  };
  createdAt: string;
  updatedAt: string;
  
  // Virtual fields
  daysOverdue?: number;
  balanceDue?: number;
  amountPaid?: number;
  isOverdue?: boolean;
}

export interface InvoiceStats {
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueCount: number;
  draftCount: number;
  sentCount: number;
  paidCount: number;
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  items: Partial<InvoiceItem>[];
}

export interface InvoiceAnalytics {
  overview: InvoiceStats;
  statusBreakdown: Array<{
    _id: string;
    count: number;
    amount: number;
  }>;
  monthlyRevenue: Array<{
    _id: {
      year: number;
      month: number;
    };
    revenue: number;
    invoiceCount: number;
  }>;
  topClients: Array<{
    _id: string;
    totalRevenue: number;
    invoiceCount: number;
    clientInfo: {
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
  overdueInvoices: {
    count: number;
    totalAmount: number;
    invoices: Invoice[];
  };
}

class InvoiceService {
  private static getAuthHeaders() {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      return token ? { Authorization: `Bearer ${token}` } : {};
    }
    return {};
  }

  // Invoice CRUD operations
  static async getInvoices(params: {
    status?: string;
    paymentStatus?: string;
    client?: string;
    project?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    invoices: Invoice[];
    total: number;
    totalPages: number;
    currentPage: number;
    stats: InvoiceStats;
  }> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await axios.get(
        `${API_BASE_URL}/invoices?${queryParams}`,
        { headers: this.getAuthHeaders() }
      );
      
      return {
        invoices: response.data.data,
        total: response.data.total,
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage,
        stats: response.data.stats,
      };
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  }

  static async getInvoice(id: string): Promise<Invoice> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/invoices/${id}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  }

  static async createInvoice(invoiceData: Partial<Invoice>): Promise<Invoice> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/invoices`,
        invoiceData,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  static async updateInvoice(id: string, invoiceData: Partial<Invoice>): Promise<Invoice> {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/invoices/${id}`,
        invoiceData,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  }

  static async deleteInvoice(id: string): Promise<void> {
    try {
      await axios.delete(
        `${API_BASE_URL}/invoices/${id}`,
        { headers: this.getAuthHeaders() }
      );
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  }

  // Payment operations
  static async addPayment(invoiceId: string, paymentData: {
    amount: number;
    paymentDate?: string;
    paymentMethod: string;
    reference?: string;
    notes?: string;
  }): Promise<Invoice> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/invoices/${invoiceId}/payments`,
        paymentData,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error adding payment:', error);
      throw error;
    }
  }

  // Invoice actions
  static async generatePDF(id: string): Promise<Blob> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/invoices/${id}/pdf`,
        { 
          headers: this.getAuthHeaders(),
          responseType: 'blob'
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  static async sendInvoice(id: string): Promise<Invoice> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/invoices/${id}/send`,
        {},
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error sending invoice:', error);
      throw error;
    }
  }

  static async duplicateInvoice(id: string): Promise<Invoice> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/invoices/${id}/duplicate`,
        {},
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error duplicating invoice:', error);
      throw error;
    }
  }

  // Templates
  static async getTemplates(): Promise<InvoiceTemplate[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/invoices/templates`,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  }

  // Analytics and reporting
  static async getAnalytics(params: {
    startDate?: string;
    endDate?: string;
  } = {}): Promise<InvoiceAnalytics> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value);
        }
      });

      const response = await axios.get(
        `${API_BASE_URL}/invoices/analytics?${queryParams}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  static async getOverdueInvoices(): Promise<{
    count: number;
    totalAmount: number;
    data: Invoice[];
  }> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/invoices/reports/overdue`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching overdue invoices:', error);
      throw error;
    }
  }

  static async getRevenueReport(params: {
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    period: {
      startDate: string;
      endDate: string;
    };
    data: {
      totalRevenue: number;
      invoiceCount: number;
      averageInvoiceValue: number;
    };
  }> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value);
        }
      });

      const response = await axios.get(
        `${API_BASE_URL}/invoices/reports/revenue?${queryParams}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue report:', error);
      throw error;
    }
  }

  static async getClientInvoices(clientId: string, params: {
    status?: string;
    paymentStatus?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
  } = {}): Promise<{
    invoices: Invoice[];
    total: number;
    totalPages: number;
    currentPage: number;
    summary: InvoiceStats;
  }> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await axios.get(
        `${API_BASE_URL}/invoices/client/${clientId}?${queryParams}`,
        { headers: this.getAuthHeaders() }
      );
      
      return {
        invoices: response.data.data,
        total: response.data.total,
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage,
        summary: response.data.summary,
      };
    } catch (error) {
      console.error('Error fetching client invoices:', error);
      throw error;
    }
  }

  // Utility methods
  static formatCurrency(amount: number, currency = 'INR'): string {
    if (currency === 'INR') {
      return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  }

  static getStatusColor(status: string): string {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-100';
      case 'sent':
        return 'text-blue-600 bg-blue-100';
      case 'viewed':
        return 'text-purple-600 bg-purple-100';
      case 'overdue':
        return 'text-red-600 bg-red-100';
      case 'cancelled':
        return 'text-gray-600 bg-gray-100';
      case 'draft':
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  }

  static getPaymentStatusColor(status: string): string {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-100';
      case 'partial':
        return 'text-yellow-600 bg-yellow-100';
      case 'refunded':
        return 'text-purple-600 bg-purple-100';
      case 'unpaid':
      default:
        return 'text-red-600 bg-red-100';
    }
  }

  static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  static downloadPDF(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export default InvoiceService;
