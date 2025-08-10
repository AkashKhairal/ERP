'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft,
  Download,
  Send,
  Edit,
  Copy,
  CreditCard,
  Calendar,
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Plus
} from 'lucide-react';
import InvoiceService, { Invoice, Payment } from '@/services/invoiceService';
import { toast } from 'react-hot-toast';

interface InvoiceDetailProps {
  invoiceId: string;
  onBack?: () => void;
  onEdit?: (invoice: Invoice) => void;
}

const InvoiceDetail: React.FC<InvoiceDetailProps> = ({ invoiceId, onBack, onEdit }) => {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Payment form state
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank_transfer',
    reference: '',
    notes: ''
  });

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const invoiceData = await InvoiceService.getInvoice(invoiceId);
      setInvoice(invoiceData);
      
      // Set payment amount to balance due
      if (invoiceData.balanceDue) {
        setPaymentForm(prev => ({ ...prev, amount: invoiceData.balanceDue || 0 }));
      }
    } catch (error: any) {
      console.error('Error loading invoice:', error);
      toast.error('Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!invoice) return;
    
    try {
      setActionLoading('pdf');
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

  const handleSendInvoice = async () => {
    if (!invoice) return;
    
    try {
      setActionLoading('send');
      await InvoiceService.sendInvoice(invoice._id);
      toast.success('Invoice sent successfully');
      loadInvoice(); // Refresh invoice data
    } catch (error: any) {
      console.error('Error sending invoice:', error);
      toast.error('Failed to send invoice');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDuplicate = async () => {
    if (!invoice) return;
    
    try {
      setActionLoading('duplicate');
      const duplicatedInvoice = await InvoiceService.duplicateInvoice(invoice._id);
      toast.success('Invoice duplicated successfully');
      
      // Navigate to edit the duplicated invoice
      if (onEdit) {
        onEdit(duplicatedInvoice);
      }
    } catch (error: any) {
      console.error('Error duplicating invoice:', error);
      toast.error('Failed to duplicate invoice');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddPayment = async () => {
    if (!invoice) return;
    
    try {
      setActionLoading('payment');
      
      if (paymentForm.amount <= 0) {
        toast.error('Payment amount must be greater than 0');
        return;
      }
      
      if (paymentForm.amount > (invoice.balanceDue || 0)) {
        toast.error('Payment amount cannot exceed balance due');
        return;
      }

      await InvoiceService.addPayment(invoice._id, paymentForm);
      toast.success('Payment added successfully');
      
      setShowPaymentForm(false);
      setPaymentForm({
        amount: 0,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'bank_transfer',
        reference: '',
        notes: ''
      });
      
      loadInvoice(); // Refresh invoice data
    } catch (error: any) {
      console.error('Error adding payment:', error);
      toast.error(error.response?.data?.message || 'Failed to add payment');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const colorClass = InvoiceService.getStatusColor(status);
    return (
      <Badge className={`${colorClass} text-sm px-3 py-1`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const colorClass = InvoiceService.getPaymentStatusColor(status);
    return (
      <Badge className={`${colorClass} text-sm px-3 py-1`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Invoice not found</h3>
        <p className="text-gray-600 mb-4">The invoice you're looking for doesn't exist.</p>
        <Button onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold">Invoice {invoice.invoiceNumber}</h1>
            <div className="flex items-center space-x-4 mt-2">
              {getStatusBadge(invoice.status)}
              {getPaymentStatusBadge(invoice.paymentStatus)}
              {invoice.isOverdue && (
                <Badge className="text-red-600 bg-red-100">
                  {invoice.daysOverdue} days overdue
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            disabled={actionLoading === 'pdf'}
          >
            {actionLoading === 'pdf' ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Download PDF
          </Button>
          
          {invoice.status !== 'paid' && (
            <Button
              variant="outline"
              onClick={handleSendInvoice}
              disabled={actionLoading === 'send'}
            >
              {actionLoading === 'send' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send Invoice
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={handleDuplicate}
            disabled={actionLoading === 'duplicate'}
          >
            {actionLoading === 'duplicate' ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            Duplicate
          </Button>
          
          {onEdit && (
            <Button onClick={() => onEdit(invoice)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Invoice Date</p>
                      <p className="font-medium">{InvoiceService.formatDate(invoice.invoiceDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Due Date</p>
                      <p className={`font-medium ${invoice.isOverdue ? 'text-red-600' : ''}`}>
                        {InvoiceService.formatDate(invoice.dueDate)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="font-medium text-lg">
                        {InvoiceService.formatCurrency(invoice.total, invoice.currency)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Amount Paid</p>
                      <p className="font-medium text-green-600">
                        {InvoiceService.formatCurrency(invoice.amountPaid || 0, invoice.currency)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Balance Due</p>
                      <p className={`font-medium ${(invoice.balanceDue || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {InvoiceService.formatCurrency(invoice.balanceDue || 0, invoice.currency)}
                      </p>
                    </div>
                  </div>
                  
                  {invoice.project && (
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Project</p>
                        <p className="font-medium">{invoice.project.name}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Client Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{invoice.clientDetails.name}</p>
                    {invoice.clientDetails.companyName && (
                      <p className="text-sm text-gray-600">{invoice.clientDetails.companyName}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <p>{invoice.clientDetails.email}</p>
                </div>
                
                {invoice.clientDetails.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <p>{invoice.clientDetails.phone}</p>
                  </div>
                )}
                
                {invoice.clientDetails.address?.line1 && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="text-sm">
                      <p>{invoice.clientDetails.address.line1}</p>
                      {invoice.clientDetails.address.line2 && (
                        <p>{invoice.clientDetails.address.line2}</p>
                      )}
                      <p>
                        {[
                          invoice.clientDetails.address.city,
                          invoice.clientDetails.address.state,
                          invoice.clientDetails.address.postalCode
                        ].filter(Boolean).join(', ')}
                      </p>
                      {invoice.clientDetails.address.country && (
                        <p>{invoice.clientDetails.address.country}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Description</th>
                      <th className="text-right py-3 px-2">Qty</th>
                      <th className="text-right py-3 px-2">Rate</th>
                      <th className="text-right py-3 px-2">Tax</th>
                      <th className="text-right py-3 px-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 px-2">{item.description}</td>
                        <td className="text-right py-3 px-2">{item.quantity}</td>
                        <td className="text-right py-3 px-2">
                          {InvoiceService.formatCurrency(item.unitPrice, invoice.currency)}
                        </td>
                        <td className="text-right py-3 px-2">{item.taxRate}%</td>
                        <td className="text-right py-3 px-2">
                          {InvoiceService.formatCurrency(item.amount, invoice.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Totals */}
                <div className="mt-6 space-y-2 text-right">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{InvoiceService.formatCurrency(invoice.subtotal, invoice.currency)}</span>
                  </div>
                  
                  {invoice.taxTotal > 0 && (
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>{InvoiceService.formatCurrency(invoice.taxTotal, invoice.currency)}</span>
                    </div>
                  )}
                  
                  {invoice.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-{InvoiceService.formatCurrency(invoice.discountAmount, invoice.currency)}</span>
                    </div>
                  )}
                  
                  <hr />
                  
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>{InvoiceService.formatCurrency(invoice.total, invoice.currency)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {(invoice.notes || invoice.terms) && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {invoice.notes && (
                  <div>
                    <h4 className="font-medium mb-2">Notes:</h4>
                    <p className="text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
                  </div>
                )}
                
                {invoice.terms && (
                  <div>
                    <h4 className="font-medium mb-2">Terms & Conditions:</h4>
                    <p className="text-gray-600 whitespace-pre-wrap">{invoice.terms}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Actions */}
          {invoice.paymentStatus !== 'paid' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Record Payment</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!showPaymentForm ? (
                  <Button 
                    onClick={() => setShowPaymentForm(true)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="payment-amount">Amount *</Label>
                      <Input
                        id="payment-amount"
                        type="number"
                        min="0"
                        max={invoice.balanceDue}
                        step="0.01"
                        value={paymentForm.amount}
                        onChange={(e) => setPaymentForm(prev => ({ 
                          ...prev, 
                          amount: parseFloat(e.target.value) || 0 
                        }))}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Max: {InvoiceService.formatCurrency(invoice.balanceDue || 0, invoice.currency)}
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="payment-date">Payment Date</Label>
                      <Input
                        id="payment-date"
                        type="date"
                        value={paymentForm.paymentDate}
                        onChange={(e) => setPaymentForm(prev => ({ 
                          ...prev, 
                          paymentDate: e.target.value 
                        }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="payment-method">Payment Method</Label>
                      <select
                        id="payment-method"
                        value={paymentForm.paymentMethod}
                        onChange={(e) => setPaymentForm(prev => ({ 
                          ...prev, 
                          paymentMethod: e.target.value 
                        }))}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="card">Card</option>
                        <option value="upi">UPI</option>
                        <option value="cash">Cash</option>
                        <option value="cheque">Cheque</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="payment-reference">Reference</Label>
                      <Input
                        id="payment-reference"
                        value={paymentForm.reference}
                        onChange={(e) => setPaymentForm(prev => ({ 
                          ...prev, 
                          reference: e.target.value 
                        }))}
                        placeholder="Transaction ID, check number, etc."
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="payment-notes">Notes</Label>
                      <Textarea
                        id="payment-notes"
                        value={paymentForm.notes}
                        onChange={(e) => setPaymentForm(prev => ({ 
                          ...prev, 
                          notes: e.target.value 
                        }))}
                        placeholder="Additional payment notes..."
                        rows={2}
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleAddPayment}
                        disabled={actionLoading === 'payment'}
                        className="flex-1"
                      >
                        {actionLoading === 'payment' ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Record Payment
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => setShowPaymentForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Payment History */}
          {invoice.payments && invoice.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoice.payments.map((payment, index) => (
                    <div key={index} className="border-l-4 border-green-400 pl-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {InvoiceService.formatCurrency(payment.amount, invoice.currency)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {InvoiceService.formatDate(payment.paymentDate.toString())}
                          </p>
                          <p className="text-sm text-gray-600">
                            {payment.paymentMethod.replace('_', ' ').toUpperCase()}
                          </p>
                        </div>
                      </div>
                      
                      {payment.reference && (
                        <p className="text-xs text-gray-500 mt-1">
                          Ref: {payment.reference}
                        </p>
                      )}
                      
                      {payment.notes && (
                        <p className="text-xs text-gray-600 mt-1">
                          {payment.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Invoice Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span>{InvoiceService.formatDate(invoice.createdAt)}</span>
                </div>
                
                {invoice.sentAt && (
                  <div className="flex justify-between">
                    <span>Sent:</span>
                    <span>{InvoiceService.formatDate(invoice.sentAt)}</span>
                  </div>
                )}
                
                {invoice.viewedAt && (
                  <div className="flex justify-between">
                    <span>Viewed:</span>
                    <span>{InvoiceService.formatDate(invoice.viewedAt)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>View Count:</span>
                  <span>{invoice.viewCount}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Created By:</span>
                  <span>{invoice.createdBy.firstName} {invoice.createdBy.lastName}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
