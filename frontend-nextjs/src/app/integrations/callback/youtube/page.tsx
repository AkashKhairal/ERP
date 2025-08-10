'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import integrationService from '@/services/integrationService'

export const dynamic = 'force-dynamic'

export default function YouTubeCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const error = searchParams.get('error')

        if (error) {
          setStatus('error')
          setMessage('Authorization was denied or an error occurred.')
          return
        }

        if (!code) {
          setStatus('error')
          setMessage('No authorization code received.')
          return
        }

        // Exchange the authorization code for tokens
        const response = await integrationService.exchangeCodeForTokens(code, 'youtube')
        
        if (response.success) {
          setStatus('success')
          setMessage('YouTube integration connected successfully!')
          
          // Close the popup window after a short delay
          setTimeout(() => {
            if (window.opener) {
              window.close()
            } else {
              router.push('/integrations')
            }
          }, 2000)
        } else {
          setStatus('error')
          setMessage(response.error || 'Failed to connect YouTube integration.')
        }
      } catch (error) {
        console.error('Error handling YouTube callback:', error)
        setStatus('error')
        setMessage('An unexpected error occurred.')
      }
    }

    handleCallback()
  }, [searchParams, router])

  const handleContinue = () => {
    if (window.opener) {
      window.close()
    } else {
      router.push('/integrations')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            {status === 'loading' && <Loader2 className="h-6 w-6 animate-spin" />}
            {status === 'success' && <CheckCircle className="h-6 w-6 text-green-600" />}
            {status === 'error' && <XCircle className="h-6 w-6 text-red-600" />}
            <span>YouTube Integration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === 'loading' && (
            <div>
              <p className="text-muted-foreground">Connecting your YouTube account...</p>
              <p className="text-sm text-muted-foreground mt-2">
                Please wait while we complete the authentication process.
              </p>
            </div>
          )}
          
          {status === 'success' && (
            <div>
              <p className="text-green-600 font-medium">{message}</p>
              <p className="text-sm text-muted-foreground mt-2">
                You can now sync your YouTube data and manage your channel from the integrations page.
              </p>
            </div>
          )}
          
          {status === 'error' && (
            <div>
              <p className="text-red-600 font-medium">{message}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Please try connecting again from the integrations page.
              </p>
            </div>
          )}
          
          <Button onClick={handleContinue} className="w-full">
            {status === 'success' ? 'Continue to Integrations' : 'Try Again'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 