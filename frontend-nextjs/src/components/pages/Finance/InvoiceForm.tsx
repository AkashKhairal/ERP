'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus,
  Minus,
  Save,
  Send,
  ArrowLeft,
  Calculator,
  Users,
  Calendar,
  Loader2,
  X
} from 'lucide-react';
import InvoiceService, { Invoice, InvoiceItem, InvoiceTemplate } from '@/services/invoiceService';
import { toast } from 'react-hot-toast';

interface InvoiceFormProps {
  invoiceId?: string;
  onSave?: (invoice: Invoice) => void;
  onCancel?: () => void;
}

interface InvoiceFormData {
  client?: string;
  clientDetails: {
    name: string;
    email: string;
    phone?: string;
    companyName?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
  };
  invoiceDate?: string;
  dueDate?: string;
  items: InvoiceItem[];
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  paymentTerms: 'immediate' | 'net_15' | 'net_30' | 'net_45' | 'net_60' | 'custom';
  discountType: 'percentage' | 'fixed';
  discountValue?: number;
  notes?: string;
  terms?: string;
  subtotal?: number;
  taxTotal?: number;
  discountAmount?: number;
  total?: number;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoiceId, onSave, onCancel }) => {
  const [invoice, setInvoice] = useState<InvoiceFormData>({
    client: '',
    clientDetails: {
      name: '',
      email: '',
      phone: '',
      companyName: '',
      address: {
        line1: '',
        line2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India'
      }
    },
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    items: [{
      description: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      taxRate: 18,
      taxAmount: 0
    }],
    currency: 'INR',
    paymentTerms: 'net_30',
    discountType: 'fixed',
    discountValue: 0,
    notes: '',
    terms: ''
  });

  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!invoiceId);

  useEffect(() => {
    loadInitialData();
    if (invoiceId) {
      loadInvoice();
    }
  }, [invoiceId]);

  useEffect(() => {
    calculateTotals();
  }, [invoice.items, invoice.discountType, invoice.discountValue]);

  const loadInitialData = async () => {
    try {
      const [templatesData] = await Promise.all([
        InvoiceService.getTemplates(),
        // loadClients() // You would implement this to load available clients
      ]);
      
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadInvoice = async () => {
    if (!invoiceId) return;
    
    try {
      setLoadingData(true);
      const invoiceData = await InvoiceService.getInvoice(invoiceId);
      
      // Convert Invoice to InvoiceFormData
      const formData: InvoiceFormData = {
        client: typeof invoiceData.client === 'object' ? invoiceData.client._id : invoiceData.client,
        clientDetails: invoiceData.clientDetails,
        invoiceDate: invoiceData.invoiceDate,
        dueDate: invoiceData.dueDate,
        items: invoiceData.items,
        currency: invoiceData.currency,
        paymentTerms: invoiceData.paymentTerms,
        discountType: invoiceData.discountType,
        discountValue: invoiceData.discountValue,
        notes: invoiceData.notes,
        terms: invoiceData.terms,
        subtotal: invoiceData.subtotal,
        taxTotal: invoiceData.taxTotal,
        discountAmount: invoiceData.discountAmount,
        total: invoiceData.total
      };
      
      setInvoice(formData);
    } catch (error: any) {
      console.error('Error loading invoice:', error);
      toast.error('Failed to load invoice');
    } finally {
      setLoadingData(false);
    }
  };

  const calculateTotals = () => {
    if (!invoice.items) return;

    // Calculate item amounts and taxes
    const updatedItems = invoice.items.map(item => ({
      ...item,
      amount: item.quantity * item.unitPrice,
      taxAmount: (item.quantity * item.unitPrice * item.taxRate) / 100
    }));

    const subtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
    const taxTotal = updatedItems.reduce((sum, item) => sum + item.taxAmount, 0);
    
    let discountAmount = 0;
    if (invoice.discountType === 'percentage') {
      discountAmount = (subtotal * (invoice.discountValue || 0)) / 100;
    } else {
      discountAmount = invoice.discountValue || 0;
    }

    const total = subtotal + taxTotal - discountAmount;

    setInvoice(prev => ({
      ...prev,
      items: updatedItems,
      subtotal,
      taxTotal,
      discountAmount,
      total
    }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...(invoice.items || [])];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    setInvoice(prev => ({ ...prev, items: updatedItems }));
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      description: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      taxRate: 18,
      taxAmount: 0
    };
    
    setInvoice(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));
  };

  const removeItem = (index: number) => {
    const updatedItems = (invoice.items || []).filter((_, i) => i !== index);
    setInvoice(prev => ({ ...prev, items: updatedItems }));
  };

  const useTemplate = (template: InvoiceTemplate) => {
    setInvoice(prev => ({
      ...prev,
      items: template.items.map(item => ({
        description: item.description || '',
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        amount: (item.quantity || 1) * (item.unitPrice || 0),
        taxRate: item.taxRate || 18,
        taxAmount: ((item.quantity || 1) * (item.unitPrice || 0) * (item.taxRate || 18)) / 100
      }))
    }));
  };

  const calculateDueDate = (paymentTerms: string, invoiceDate: string) => {
    if (!invoiceDate) return '';
    
    const date = new Date(invoiceDate);
    const daysToAdd = {
      'immediate': 0,
      'net_15': 15,
      'net_30': 30,
      'net_45': 45,
      'net_60': 60
    };
    
    const days = daysToAdd[paymentTerms as keyof typeof daysToAdd] || 30;
    date.setDate(date.getDate() + days);
    
    return date.toISOString().split('T')[0];
  };

  const handlePaymentTermsChange = (terms: string) => {
    const dueDate = calculateDueDate(terms, invoice.invoiceDate || '');
    setInvoice(prev => ({
      ...prev,
      paymentTerms: terms,
      dueDate
    }));
  };

  const handleSave = async (sendAfterSave = false) => {
    try {
      setSaveLoading(true);
      
      // Validate required fields
      if (!invoice.client) {
        toast.error('Please select a client');
        return;
      }
      
      if (!invoice.items || invoice.items.length === 0) {
        toast.error('Please add at least one item');
        return;
      }
      
      if (invoice.items.some(item => !item.description.trim())) {
        toast.error('Please fill in all item descriptions');
        return;
      }

      let savedInvoice: Invoice;
      
      if (invoiceId) {
        savedInvoice = await InvoiceService.updateInvoice(invoiceId, invoice);
        toast.success('Invoice updated successfully');
      } else {
        savedInvoice = await InvoiceService.createInvoice(invoice);
        toast.success('Invoice created successfully');
      }

      if (sendAfterSave && savedInvoice.status === 'draft') {
        await InvoiceService.sendInvoice(savedInvoice._id);
        toast.success('Invoice sent successfully');
      }

      onSave?.(savedInvoice);
    } catch (error: any) {
      console.error('Error saving invoice:', error);
      toast.error(error.response?.data?.message || 'Failed to save invoice');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onCancel && (
            <Button variant="ghost" onClick={onCancel}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold">
              {invoiceId ? 'Edit Invoice' : 'Create Invoice'}
            </h1>
            <p className="text-gray-600">
              {invoiceId ? 'Update invoice details' : 'Create a new invoice for your client'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={saveLoading}
          >
            {saveLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Draft
          </Button>
          
          <Button
            onClick={() => handleSave(true)}
            disabled={saveLoading}
          >
            {saveLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Save & Send
          </Button>
        </div>
      </div>

      {/* Templates */}
      {!invoiceId && templates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Templates</CardTitle>
            <CardDescription>Choose a template to get started quickly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {templates.map((template) => (
                <Button
                  key={template.id}
                  variant="outline"
                  onClick={() => useTemplate(template)}
                  className="h-auto p-4 flex flex-col items-start"
                >
                  <h3 className="font-medium">{template.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Client Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="client-name">Client Name *</Label>
                <Input
                  id="client-name"
                  value={invoice.clientDetails?.name || ''}
                  onChange={(e) => setInvoice(prev => ({
                    ...prev,
                    clientDetails: {
                      ...prev.clientDetails!,
                      name: e.target.value
                    }
                  }))}
                  placeholder="Enter client name"
                />
              </div>
              
              <div>
                <Label htmlFor="client-email">Email *</Label>
                <Input
                  id="client-email"
                  type="email"
                  value={invoice.clientDetails?.email || ''}
                  onChange={(e) => setInvoice(prev => ({
                    ...prev,
                    clientDetails: {
                      ...prev.clientDetails!,
                      email: e.target.value
                    }
                  }))}
                  placeholder="client@example.com"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client-phone">Phone</Label>
                  <Input
                    id="client-phone"
                    value={invoice.clientDetails?.phone || ''}
                    onChange={(e) => setInvoice(prev => ({
                      ...prev,
                      clientDetails: {
                        ...prev.clientDetails!,
                        phone: e.target.value
                      }
                    }))}
                    placeholder="+91 98765 43210"
                  />
                </div>
                
                <div>
                  <Label htmlFor="client-company">Company</Label>
                  <Input
                    id="client-company"
                    value={invoice.clientDetails?.companyName || ''}
                    onChange={(e) => setInvoice(prev => ({
                      ...prev,
                      clientDetails: {
                        ...prev.clientDetails!,
                        companyName: e.target.value
                      }
                    }))}
                    placeholder="Company Name"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Invoice Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="invoice-date">Invoice Date *</Label>
                  <Input
                    id="invoice-date"
                    type="date"
                    value={invoice.invoiceDate || ''}
                    onChange={(e) => setInvoice(prev => ({ ...prev, invoiceDate: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="payment-terms">Payment Terms</Label>
                  <select
                    id="payment-terms"
                    value={invoice.paymentTerms || 'net_30'}
                    onChange={(e) => handlePaymentTermsChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="immediate">Due Immediately</option>
                    <option value="net_15">Net 15 Days</option>
                    <option value="net_30">Net 30 Days</option>
                    <option value="net_45">Net 45 Days</option>
                    <option value="net_60">Net 60 Days</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="due-date">Due Date *</Label>
                  <Input
                    id="due-date"
                    type="date"
                    value={invoice.dueDate || ''}
                    onChange={(e) => setInvoice(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Invoice Items</span>
                <Button onClick={addItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoice.items?.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Item {index + 1}</h4>
                      {(invoice.items?.length || 0) > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div>
                      <Label>Description *</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        placeholder="Item description"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      
                      <div>
                        <Label>Unit Price</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      
                      <div>
                        <Label>Tax Rate (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={item.taxRate}
                          onChange={(e) => handleItemChange(index, 'taxRate', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      
                      <div>
                        <Label>Amount</Label>
                        <Input
                          value={InvoiceService.formatCurrency(item.amount, invoice.currency)}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={invoice.notes || ''}
                  onChange={(e) => setInvoice(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes for the client..."
                />
              </div>
              
              <div>
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea
                  id="terms"
                  value={invoice.terms || ''}
                  onChange={(e) => setInvoice(prev => ({ ...prev, terms: e.target.value }))}
                  placeholder="Payment terms and conditions..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>Invoice Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{InvoiceService.formatCurrency(invoice.subtotal || 0, invoice.currency)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>{InvoiceService.formatCurrency(invoice.taxTotal || 0, invoice.currency)}</span>
                </div>
                
                {(invoice.discountAmount || 0) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-{InvoiceService.formatCurrency(invoice.discountAmount || 0, invoice.currency)}</span>
                  </div>
                )}
                
                <hr />
                
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>{InvoiceService.formatCurrency(invoice.total || 0, invoice.currency)}</span>
                </div>
              </div>

              {/* Discount */}
              <div className="space-y-2">
                <Label>Discount</Label>
                <div className="flex space-x-2">
                  <select
                    value={invoice.discountType || 'fixed'}
                    onChange={(e) => setInvoice(prev => ({ ...prev, discountType: e.target.value as 'percentage' | 'fixed' }))}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="fixed">Fixed</option>
                    <option value="percentage">Percentage</option>
                  </select>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={invoice.discountValue || 0}
                    onChange={(e) => setInvoice(prev => ({ ...prev, discountValue: parseFloat(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm;
