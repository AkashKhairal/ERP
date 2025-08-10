'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import InvoiceDetail from '@/components/pages/Finance/InvoiceDetail';
import { Invoice } from '@/services/invoiceService';

interface InvoiceDetailPageProps {
  params: {
    id: string;
  };
}

export default function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const router = useRouter();

  const handleBack = () => {
    router.push('/invoices');
  };

  const handleEdit = (invoice: Invoice) => {
    router.push(`/invoices/${invoice._id}/edit`);
  };

  return (
    <InvoiceDetail
      invoiceId={params.id}
      onBack={handleBack}
      onEdit={handleEdit}
    />
  );
}
