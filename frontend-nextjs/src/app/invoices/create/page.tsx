'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import InvoiceForm from '@/components/pages/Finance/InvoiceForm';
import { Invoice } from '@/services/invoiceService';

export default function CreateInvoicePage() {
  const router = useRouter();

  const handleSave = (invoice: Invoice) => {
    // Navigate to the invoice detail page
    router.push(`/invoices/${invoice._id}`);
  };

  const handleCancel = () => {
    router.push('/invoices');
  };

  return (
    <InvoiceForm
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
