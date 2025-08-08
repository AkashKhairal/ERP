import Layout from '@/components/Layout/Layout'
import ProtectedRoute from '@/components/Auth/ProtectedRoute'
import { AuthProvider } from '@/context/AuthContext'
import { Toaster } from 'react-hot-toast'
import './globals.css'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'CreatorBase - Complete management platform',
  description: 'Complete management platform for content creators and SaaS development teams',
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))',
              },
            }}
          />
          <ProtectedRoute>
            <Layout>
              {children}
            </Layout>
          </ProtectedRoute>
        </AuthProvider>
      </body>
    </html>
  )
} 