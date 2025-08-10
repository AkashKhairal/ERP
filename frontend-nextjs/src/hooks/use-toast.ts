import { toast as hotToast, ToastOptions } from 'react-hot-toast'

interface ToastOptionsExtended extends ToastOptions {
  duration?: number
}

export const useToast = () => {
  const toast = {
    success: (message: string, options?: ToastOptionsExtended) => {
      return hotToast.success(message, {
        duration: 4000,
        position: 'top-right',
        ...options,
      })
    },
    error: (message: string, options?: ToastOptionsExtended) => {
      return hotToast.error(message, {
        duration: 6000,
        position: 'top-right',
        ...options,
      })
    },
    warning: (message: string, options?: ToastOptionsExtended) => {
      return hotToast(message, {
        icon: '⚠️',
        duration: 5000,
        position: 'top-right',
        style: {
          background: '#fbbf24',
          color: '#1f2937',
        },
        ...options,
      })
    },
    info: (message: string, options?: ToastOptionsExtended) => {
      return hotToast(message, {
        icon: 'ℹ️',
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#3b82f6',
          color: 'white',
        },
        ...options,
      })
    },
    loading: (message: string, options?: ToastOptionsExtended) => {
      return hotToast.loading(message, {
        position: 'top-right',
        ...options,
      })
    },
    dismiss: (toastId: string) => {
      hotToast.dismiss(toastId)
    },
  }

  return toast
}
