'use client'

import { useEffect, useState } from 'react'

const EnvBanner = () => {
  const [env, setEnv] = useState<string>('unknown')

  useEffect(() => {
    setEnv(process.env.NEXT_PUBLIC_APP_ENV || 'unknown')
  }, [])

  // Don't show banner in production
  if (env === 'production') return null

  const getEnvColor = (env: string) => {
    switch (env) {
      case 'development':
        return 'bg-blue-500 text-white'
      case 'staging':
        return 'bg-yellow-500 text-black'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const getEnvText = (env: string) => {
    switch (env) {
      case 'development':
        return 'DEV'
      case 'staging':
        return 'STAGING'
      default:
        return env.toUpperCase()
    }
  }

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 text-center py-1 text-xs font-mono font-bold ${getEnvColor(env)}`}>
      {getEnvText(env)} ENVIRONMENT
    </div>
  )
}

export default EnvBanner
