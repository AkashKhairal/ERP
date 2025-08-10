'use client'

import React, { useState, useEffect } from 'react';
import { X, Upload, Calendar, DollarSign, Tag, FileText, User, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import * as financeService from '@/services/financeService';
import { Transaction } from '@/services/financeService';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
  onSuccess?: (transaction: Transaction) => void;
  employees?: Array<{ _id: string; firstName: string; lastName: string }>;
  projects?: Array<{ _id: string; name: string }>;
  trigger?: React.ReactNode;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ 
  isOpen, 
  onClose, 
  transaction = null, 
  onSuccess,
  employees = [],
  projects = [],
  trigger
}) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'upi',
    status: 'completed' as 'completed' | 'pending' | 'cancelled' | 'failed',
    linkedProject: '',
    linkedEmployee: '',
    tags: [] as string[],
    notes: '',
    receipt: null as File | null
  });
  const [tagInput, setTagInput] = useState('');

  // Initialize form data when transaction changes
  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type || 'expense',
        category: transaction.category || '',
        amount: transaction.amount?.toString() || '',
        description: transaction.description || '',
        date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        paymentMethod: transaction.paymentMethod || 'upi',
        status: (transaction.status || 'completed') as 'completed' | 'pending' | 'cancelled' | 'failed',
        linkedProject: transaction.linkedProject?._id || '',
        linkedEmployee: transaction.linkedEmployee?._id || '',
        tags: transaction.tags || [],
        notes: transaction.notes || '',
        receipt: null
      });
    } else {
      setFormData({
        type: 'expense',
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'upi',
        status: 'completed' as 'completed' | 'pending' | 'cancelled' | 'failed',
        linkedProject: '',
        linkedEmployee: '',
        tags: [],
        notes: '',
        receipt: null
      });
    }
    setErrors({});
    setTagInput('');
  }, [transaction, isOpen]);

  const incomeCategories = financeService.getIncomeCategories();
  const expenseCategories = financeService.getExpenseCategories();
  const paymentMethods = financeService.getPaymentMethods();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.paymentMethod) newErrors.paymentMethod = 'Payment method is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
          // Create API-compatible payload
    const submitData: any = {
      type: formData.type,
      category: formData.category,
      amount: parseFloat(formData.amount),
      description: formData.description,
      date: formData.date,
      paymentMethod: formData.paymentMethod,
      status: formData.status,
      notes: formData.notes,
      tags: formData.tags.filter(tag => tag.trim() !== ''),
      // Send only IDs for linked entities - backend will populate full objects
      ...(formData.linkedProject && { linkedProject: formData.linkedProject }),
      ...(formData.linkedEmployee && { linkedEmployee: formData.linkedEmployee }),
    };

      let result;
      if (transaction) {
        result = await financeService.updateTransaction(transaction._id, submitData);
      } else {
        result = await financeService.createTransaction(submitData);
      }

      if (result.success) {
        onSuccess?.(result.data);
        onClose();
      }
    } catch (error: any) {
      console.error('Transaction save error:', error);
      setErrors({ submit: error.message || 'Failed to save transaction' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, receipt: 'File size must be less than 5MB' }));
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, receipt: 'Only JPEG, PNG, GIF, and PDF files are allowed' }));
        return;
      }

      setFormData(prev => ({ ...prev, receipt: file }));
      setErrors(prev => ({ ...prev, receipt: '' }));
    }
  };

  const currentCategories = formData.type === 'income' ? incomeCategories : expenseCategories;

  const modalContent = (
    <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {transaction ? 'Edit Transaction' : 'Add New Transaction'}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6 mt-6">
        {/* Transaction Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="type">Transaction Type *</Label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => {
                handleInputChange('type', e.target.value);
                handleInputChange('category', ''); // Reset category when type changes
              }}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className={`mt-1 block w-full rounded-md border px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Category</option>
              {currentCategories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
          </div>
        </div>

        {/* Amount and Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="amount">Amount (₹) *</Label>
            <div className="relative mt-1">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className={`pl-10 ${errors.amount ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
          </div>

          <div>
            <Label htmlFor="date">Date *</Label>
            <div className="relative mt-1">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={`pl-10 ${errors.date ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
          </div>
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Description *</Label>
          <div className="relative mt-1">
            <FileText className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
            <Textarea
              id="description"
              placeholder="Enter transaction description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`pl-10 min-h-[80px] ${errors.description ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>

        {/* Payment Method and Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="paymentMethod">Payment Method *</Label>
            <select
              id="paymentMethod"
              value={formData.paymentMethod}
              onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
              className={`mt-1 block w-full rounded-md border px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                errors.paymentMethod ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              {paymentMethods.map(method => (
                <option key={method.value} value={method.value}>{method.label}</option>
              ))}
            </select>
            {errors.paymentMethod && <p className="mt-1 text-sm text-red-600">{errors.paymentMethod}</p>}
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value as 'completed' | 'pending' | 'cancelled' | 'failed')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Linked Project and Employee */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="linkedProject">Linked Project</Label>
            <div className="relative mt-1">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                id="linkedProject"
                value={formData.linkedProject}
                onChange={(e) => handleInputChange('linkedProject', e.target.value)}
                className="pl-10 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select Project</option>
                {projects.map(project => (
                  <option key={project._id} value={project._id}>{project.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="linkedEmployee">Linked Employee</Label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                id="linkedEmployee"
                value={formData.linkedEmployee}
                onChange={(e) => handleInputChange('linkedEmployee', e.target.value)}
                className="pl-10 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select Employee</option>
                {employees.map(employee => (
                  <option key={employee._id} value={employee._id}>
                    {employee.firstName} {employee.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <Label htmlFor="tags">Tags</Label>
          <div className="mt-1">
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="tags"
                placeholder="Add tags (press Enter to add)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Receipt Upload */}
        <div>
          <Label htmlFor="receipt">Receipt Upload</Label>
          <div className="mt-1">
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="receipt"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> receipt
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF or PDF (MAX. 5MB)</p>
                </div>
                <input
                  id="receipt"
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            {formData.receipt && (
              <p className="mt-2 text-sm text-green-600">
                File selected: {formData.receipt.name}
              </p>
            )}
            {errors.receipt && <p className="mt-1 text-sm text-red-600">{errors.receipt}</p>}
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Additional notes (optional)"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            className="mt-1 min-h-[60px]"
          />
        </div>

        {/* Submit Errors */}
        {errors.submit && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{errors.submit}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="min-w-[100px]"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              transaction ? 'Update' : 'Create'
            )}
          </Button>
        </div>
      </form>
    </div>
  );

  if (trigger) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {modalContent}
        </DialogContent>
      </Dialog>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        {modalContent}
      </div>
    </div>
  );
};

export default TransactionModal;
