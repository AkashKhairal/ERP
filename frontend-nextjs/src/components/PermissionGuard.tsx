'use client'

import React from 'react'
import { usePermissions } from '@/services/permissionService'
import { Button } from '@/components/ui/button'
import { Shield, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface PermissionGuardProps {
  module: string
  action: string
  children: React.ReactNode
  fallback?: React.ReactNode
  showToast?: boolean
  toastMessage?: string
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  module,
  action,
  children,
  fallback,
  showToast = true,
  toastMessage
}) => {
  const { hasPermission } = usePermissions()

  const handleUnauthorizedAction = () => {
    if (showToast) {
      const message = toastMessage || `You don't have permission to ${action} in the ${module} module. Please ask an admin for permissions.`
      toast.error(message, {
        duration: 5000,
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        style: {
          background: '#fef2f2',
          color: '#dc2626',
          border: '1px solid #fecaca',
        },
      })
    }
  }

  if (!hasPermission(module, action)) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleUnauthorizedAction}
        className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700"
      >
        <Shield className="h-4 w-4 mr-2" />
        Ask Admin for Permissions
      </Button>
    )
  }

  return <>{children}</>
}

export default PermissionGuard
