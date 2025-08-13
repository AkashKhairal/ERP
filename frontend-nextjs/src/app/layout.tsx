import Layout from '@/components/Layout/Layout'
import ProtectedRoute from '@/components/Auth/ProtectedRoute'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { NotificationProvider } from '@/context/NotificationContext'
import { SubscriptionProvider } from '@/context/SubscriptionContext'
import { Toaster } from 'react-hot-toast'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import type { Metadata } from 'next'
import ConditionalLayout from '@/components/ConditionalLayout'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Poppins } from 'next/font/google'
import EnvBanner from '@/components/EnvBanner'

const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

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
    <html lang="en" className={poppins.className}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{
          __html: `
            * { font-family: 'Poppins', system-ui, -apple-system, sans-serif !important; }
            body { font-family: 'Poppins', system-ui, -apple-system, sans-serif !important; }
          `
        }} />
      </head>
      <body className={poppins.className} style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}>
        <EnvBanner />
        <GoogleOAuthProvider clientId={googleClientId}>
          <ThemeProvider>
            <AuthProvider>
              <SubscriptionProvider>
                <NotificationProvider>
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
                </NotificationProvider>
              </SubscriptionProvider>
            </AuthProvider>
          </ThemeProvider>
        </GoogleOAuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
} 