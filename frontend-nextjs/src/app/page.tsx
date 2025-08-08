import { redirect } from 'next/navigation'
import Dashboard from '@/components/pages/Dashboard'

export const dynamic = 'force-dynamic'

export default function AppPage() {
  redirect('/dashboard')
} 