'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Mail, Lock, Sparkles } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface LoginFormData {
  email: string
  password: string
}

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const { login, googleSignIn, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>()

  const onSubmit = async (data: LoginFormData) => {
    try {
      console.log('Login attempt with:', { email: data.email, password: data.password ? '***' : 'empty' })
      await login(data.email, data.password)
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error.message || 'Login failed')
    }
  }

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      console.log('Google sign-in response:', credentialResponse)
      if (!credentialResponse.credential) {
        toast.error('Google sign-in failed: No credential received')
        return
      }
      await googleSignIn(credentialResponse.credential)
    } catch (error: any) {
      console.error('Google sign-in error:', error)
      toast.error(error.message || 'Google Sign-In failed')
    }
  }

  const handleGoogleError = (error: any) => {
    console.error('Google sign-in error:', error)
    toast.error('Google Sign-In failed. Please try again.')
  }

  if (isAuthenticated) {
    router.push('/dashboard')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fafafa] via-[#fdfdfd] to-[#f5f5f5] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Luxury Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200/30 to-red-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-amber-200/30 to-orange-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-md w-full space-y-8">
        {/* Luxury Login Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 animate-fade-in-up">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h2 className="page-title text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600 font-medium tracking-tight">
              Sign in to your premium workspace
            </p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 tracking-tight">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className={`pl-12 h-12 bg-white/60 backdrop-blur-sm border-gray-200/50 rounded-xl text-gray-900 placeholder:text-gray-500 focus:bg-white/80 focus:border-orange-300 focus:ring-orange-200 transition-all duration-200 ${errors.email ? 'border-red-300 focus:border-red-400' : ''}`}
                  placeholder="Enter your email address"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 font-medium tracking-tight">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 tracking-tight">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  className={`pl-12 pr-12 h-12 bg-white/60 backdrop-blur-sm border-gray-200/50 rounded-xl text-gray-900 placeholder:text-gray-500 focus:bg-white/80 focus:border-orange-300 focus:ring-orange-200 transition-all duration-200 ${errors.password ? 'border-red-300 focus:border-red-400' : ''}`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 font-medium tracking-tight">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded transition-colors"
                />
                <label htmlFor="remember-me" className="ml-3 block text-sm text-gray-700 font-medium tracking-tight">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link 
                  href="/forgot-password" 
                  className="font-semibold text-orange-600 hover:text-orange-500 tracking-tight transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Sign In Button */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full h-12 bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-semibold tracking-tight rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              >
                {isSubmitting || loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </div>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/80 text-gray-500 font-medium tracking-tight">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Sign In */}
            <div className="flex justify-center">
              <div className="w-full">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 p-3 hover:bg-white/80 transition-all duration-200">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => handleGoogleError('Google sign-in failed')}
                    useOneTap
                    theme="outline"
                    size="large"
                    text="signin_with"
                    shape="rectangular"
                    width="100%"
                  />
                </div>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-600 font-medium tracking-tight">
                Don't have an account?{' '}
                <Link 
                  href="/register" 
                  className="font-semibold text-orange-600 hover:text-orange-500 transition-colors"
                >
                  Create one here
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500 font-medium tracking-tight">
            © 2024 CreatorBase. Premium workspace for creators.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login