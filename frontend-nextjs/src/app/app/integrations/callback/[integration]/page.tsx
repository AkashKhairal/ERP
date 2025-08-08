'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import integrationService from '@/services/integrationService'

export default function IntegrationCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [integrationName, setIntegrationName] = useState('')

  const integrationId = params.integration as string

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const error = searchParams.get('error')

        // Get integration details
        const integrations = integrationService.getAvailableIntegrations()
        const integration = integrations.find(i => i._id === integrationId)
        
        if (integration) {
          setIntegrationName(integration.name)
        }

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

        // Connect the integration with the auth code
        const response = await integrationService.connectIntegration(integrationId, code)
        
        if (response.success) {
          setStatus('success')
          setMessage(`${integrationName || 'Integration'} connected successfully!`)
        } else {
          setStatus('error')
          setMessage(response.error || `Failed to connect ${integrationName || 'integration'}.`)
        }
      } catch (error) {
        console.error('Error handling integration callback:', error)
        setStatus('error')
        setMessage('An unexpected error occurred.')
      }
    }

    if (integrationId) {
      handleCallback()
    }
  }, [integrationId, searchParams, integrationName])

  const handleContinue = () => {
    router.push('/app/integrations')
  }

  const getIntegrationIcon = (id: string) => {
    const integrations = integrationService.getAvailableIntegrations()
    const integration = integrations.find(i => i._id === id)
    return integration?.icon || '🔗'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            {status === 'loading' && <Loader2 className="h-6 w-6 animate-spin" />}
            {status === 'success' && <CheckCircle className="h-6 w-6 text-green-600" />}
            {status === 'error' && <XCircle className="h-6 w-6 text-red-600" />}
            <span className="text-2xl mr-2">{getIntegrationIcon(integrationId)}</span>
            <span>{integrationName || 'Integration'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === 'loading' && (
            <div>
              <p className="text-muted-foreground">Connecting your {integrationName || 'integration'}...</p>
            </div>
          )}
          
          {status === 'success' && (
            <div>
              <p className="text-green-600 font-medium">{message}</p>
              <p className="text-sm text-muted-foreground mt-2">
                You can now sync your data and manage your {integrationName || 'integration'} from the integrations page.
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
            Continue to Integrations
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 