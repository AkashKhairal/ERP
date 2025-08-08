import { redirect } from 'next/navigation'
import Dashboard from '@/components/pages/Dashboard'

export default function AppPage() {
  redirect('/app/dashboard')
} 