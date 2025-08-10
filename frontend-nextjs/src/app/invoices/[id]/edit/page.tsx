'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import InvoiceForm from '@/components/pages/Finance/InvoiceForm';
import { Invoice } from '@/services/invoiceService';

interface EditInvoicePageProps {
  params: {
    id: string;
  };
}

export default function EditInvoicePage({ params }: EditInvoicePageProps) {
  const router = useRouter();

  const handleSave = (invoice: Invoice) => {
    // Navigate back to the invoice detail page
    router.push(`/invoices/${invoice._id}`);
  };

  const handleCancel = () => {
    router.push(`/invoices/${params.id}`);
  };

  return (
    <InvoiceForm
      invoiceId={params.id}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
