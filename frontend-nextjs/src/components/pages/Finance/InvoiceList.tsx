'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table } from '@/components/ui/table';
import { 
  Plus,
  FileText,
  Download,
  Send,
  Copy,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  Loader2,
  MoreHorizontal
} from 'lucide-react';
import InvoiceService, { Invoice, InvoiceStats } from '@/services/invoiceService';
import { toast } from 'react-hot-toast';

const InvoiceList: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(20);

  useEffect(() => {
    loadInvoices();
  }, [page, statusFilter, paymentStatusFilter]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      
      const params = {
        page,
        limit,
        ...(statusFilter && { status: statusFilter }),
        ...(paymentStatusFilter && { paymentStatus: paymentStatusFilter }),
        ...(searchTerm && { search: searchTerm })
      };

      const response = await InvoiceService.getInvoices(params);
      
      setInvoices(response.invoices);
      setStats(response.stats);
      setTotalPages(response.totalPages);
    } catch (error: any) {
      console.error('Error loading invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadInvoices();
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      setActionLoading(`pdf-${invoice._id}`);
      
      const pdfBlob = await InvoiceService.generatePDF(invoice._id);
      InvoiceService.downloadPDF(pdfBlob, `invoice-${invoice.invoiceNumber}.pdf`);
      
      toast.success('PDF downloaded successfully');
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendInvoice = async (invoice: Invoice) => {
    try {
      setActionLoading(`send-${invoice._id}`);
      
      await InvoiceService.sendInvoice(invoice._id);
      
      toast.success('Invoice sent successfully');
      loadInvoices(); // Refresh list
    } catch (error: any) {
      console.error('Error sending invoice:', error);
      toast.error('Failed to send invoice');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDuplicateInvoice = async (invoice: Invoice) => {
    try {
      setActionLoading(`duplicate-${invoice._id}`);
      
      await InvoiceService.duplicateInvoice(invoice._id);
      
      toast.success('Invoice duplicated successfully');
      loadInvoices(); // Refresh list
    } catch (error: any) {
      console.error('Error duplicating invoice:', error);
      toast.error('Failed to duplicate invoice');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteInvoice = async (invoice: Invoice) => {
    if (!window.confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}?`)) {
      return;
    }

    try {
      setActionLoading(`delete-${invoice._id}`);
      
      await InvoiceService.deleteInvoice(invoice._id);
      
      toast.success('Invoice deleted successfully');
      loadInvoices(); // Refresh list
    } catch (error: any) {
      console.error('Error deleting invoice:', error);
      toast.error('Failed to delete invoice');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const colorClass = InvoiceService.getStatusColor(status);
    return (
      <Badge className={`${colorClass} text-xs`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const colorClass = InvoiceService.getPaymentStatusColor(status);
    return (
      <Badge className={`${colorClass} text-xs`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-gray-600">Manage your invoices and track payments</p>
        </div>
        <Button onClick={() => window.location.href = '/invoices/create'}>
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                  <p className="text-2xl font-bold">{stats.totalInvoices}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Paid Amount</p>
                  <p className="text-2xl font-bold">
                    {InvoiceService.formatCurrency(stats.paidAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold">
                    {InvoiceService.formatCurrency(stats.pendingAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold">{stats.overdueCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="viewed">Viewed</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="">All Payments</option>
                <option value="unpaid">Unpaid</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
              </select>

              <Button variant="outline" onClick={handleSearch}>
                <Filter className="h-4 w-4 mr-2" />
                Apply
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice List</CardTitle>
          <CardDescription>
            {invoices.length} of {stats?.totalInvoices || 0} invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No invoices found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter || paymentStatusFilter
                  ? 'Try adjusting your filters'
                  : 'Create your first invoice to get started'
                }
              </p>
              <Button onClick={() => window.location.href = '/invoices/create'}>
                Create Invoice
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Invoice #</th>
                    <th className="text-left py-3 px-4 font-medium">Client</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Due Date</th>
                    <th className="text-left py-3 px-4 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Payment</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{invoice.invoiceNumber}</div>
                        {invoice.project && (
                          <div className="text-sm text-gray-500">{invoice.project.name}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium">
                          {invoice.client.firstName} {invoice.client.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{invoice.client.email}</div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {InvoiceService.formatDate(invoice.invoiceDate)}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div className={invoice.isOverdue ? 'text-red-600' : ''}>
                          {InvoiceService.formatDate(invoice.dueDate)}
                        </div>
                        {invoice.isOverdue && (
                          <div className="text-xs text-red-500">
                            {invoice.daysOverdue} days overdue
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium">
                          {InvoiceService.formatCurrency(invoice.total, invoice.currency)}
                        </div>
                        {invoice.balanceDue && invoice.balanceDue > 0 && (
                          <div className="text-sm text-gray-500">
                            Due: {InvoiceService.formatCurrency(invoice.balanceDue, invoice.currency)}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="py-3 px-4">
                        {getPaymentStatusBadge(invoice.paymentStatus)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.location.href = `/invoices/${invoice._id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadPDF(invoice)}
                            disabled={actionLoading === `pdf-${invoice._id}`}
                          >
                            {actionLoading === `pdf-${invoice._id}` ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                          </Button>

                          {invoice.status !== 'paid' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSendInvoice(invoice)}
                              disabled={actionLoading === `send-${invoice._id}`}
                            >
                              {actionLoading === `send-${invoice._id}` ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
                            </Button>
                          )}

                          <div className="relative">
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            {/* Dropdown menu would go here */}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceList;
