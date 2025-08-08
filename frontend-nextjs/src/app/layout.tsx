import Layout from '@/components/Layout/Layout'
import ProtectedRoute from '@/components/Auth/ProtectedRoute'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <Layout>
        {children}
      </Layout>
    </ProtectedRoute>
  )
} 