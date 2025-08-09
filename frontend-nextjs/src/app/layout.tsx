import Layout from '@/components/Layout/Layout'
import ProtectedRoute from '@/components/Auth/ProtectedRoute'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { Toaster } from 'react-hot-toast'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import type { Metadata } from 'next'
import ConditionalLayout from '@/components/ConditionalLayout'
import { GoogleOAuthProvider } from '@react-oauth/google'

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
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '852792982943-iadr4llqoiigtpkqc2blcfq25q00plv6.apps.googleusercontent.com'
  
  return (
    <html lang="en">
      <body>
        <GoogleOAuthProvider clientId={googleClientId}>
          <ThemeProvider>
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
              <ConditionalLayout>
                {children}
              </ConditionalLayout>
            </AuthProvider>
          </ThemeProvider>
        </GoogleOAuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
} 