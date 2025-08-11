'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, User, Mail, Building, Phone, Sparkles, Lock } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GoogleLogin } from '@react-oauth/google'

interface RegisterFormData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  phone?: string
  department: string
  role: string
  terms: boolean
}

const Register = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { register: registerUser, googleSignIn } = useAuth()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RegisterFormData>()

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

  const departments = [
    'Engineering',
    'Design',
    'Marketing',
    'Sales',
    'HR',
    'Finance',
    'Operations'
  ]

  const roles = [
    'Admin',
    'Manager',
    'Employee',
    'Viewer'
  ]

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true)
      await registerUser(data)
      toast.success('Registration successful!')
      router.push('/login')
    } catch (error: any) {
      toast.error(error.message || 'Registration failed')
    } finally {
      setLoading(false)
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fafafa] via-[#fdfdfd] to-[#f5f5f5] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      {/* Luxury Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200/30 to-red-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-amber-200/30 to-orange-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-orange-100/20 to-red-100/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-2xl w-full space-y-8">
        {/* Luxury Register Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 animate-fade-in-up">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h2 className="page-title text-gray-900 mb-2">Join CreatorBase</h2>
            <p className="text-gray-600 font-medium tracking-tight">
              Create your premium workspace account
            </p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 tracking-tight">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="firstName"
                    type="text"
                    {...register('firstName', {
                      required: 'First name is required',
                      minLength: {
                        value: 2,
                        message: 'First name must be at least 2 characters'
                      }
                    })}
                    className={`pl-12 h-12 bg-white/60 backdrop-blur-sm border-gray-200/50 rounded-xl text-gray-900 placeholder:text-gray-500 focus:bg-white/80 focus:border-orange-300 focus:ring-orange-200 transition-all duration-200 ${errors.firstName ? 'border-red-300 focus:border-red-400' : ''}`}
                    placeholder="Enter first name"
                  />
                </div>
                {errors.firstName && (
                  <p className="text-sm text-red-600 font-medium tracking-tight">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 tracking-tight">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="lastName"
                    type="text"
                    {...register('lastName', {
                      required: 'Last name is required',
                      minLength: {
                        value: 2,
                        message: 'Last name must be at least 2 characters'
                      }
                    })}
                    className={`pl-12 h-12 bg-white/60 backdrop-blur-sm border-gray-200/50 rounded-xl text-gray-900 placeholder:text-gray-500 focus:bg-white/80 focus:border-orange-300 focus:ring-orange-200 transition-all duration-200 ${errors.lastName ? 'border-red-300 focus:border-red-400' : ''}`}
                    placeholder="Enter last name"
                  />
                </div>
                {errors.lastName && (
                  <p className="text-sm text-red-600 font-medium tracking-tight">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
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

            {/* Password Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                    {...register('password', {
                      required: 'Password is required',
                      pattern: {
                        value: passwordRegex,
                        message: 'Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character'
                      }
                    })}
                    className={`pl-12 pr-12 h-12 bg-white/60 backdrop-blur-sm border-gray-200/50 rounded-xl text-gray-900 placeholder:text-gray-500 focus:bg-white/80 focus:border-orange-300 focus:ring-orange-200 transition-all duration-200 ${errors.password ? 'border-red-300 focus:border-red-400' : ''}`}
                    placeholder="Create password"
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

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 tracking-tight">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) => value === watch('password') || 'Passwords do not match'
                    })}
                    className={`pl-12 pr-12 h-12 bg-white/60 backdrop-blur-sm border-gray-200/50 rounded-xl text-gray-900 placeholder:text-gray-500 focus:bg-white/80 focus:border-orange-300 focus:ring-orange-200 transition-all duration-200 ${errors.confirmPassword ? 'border-red-300 focus:border-red-400' : ''}`}
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-gray-600 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 font-medium tracking-tight">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Department and Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="department" className="block text-sm font-semibold text-gray-700 tracking-tight">
                  Department
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="department"
                    {...register('department', { required: 'Department is required' })}
                    className={`block w-full pl-12 pr-4 py-3 h-12 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl text-gray-900 focus:bg-white/80 focus:border-orange-300 focus:ring-orange-200 transition-all duration-200 ${errors.department ? 'border-red-300 focus:border-red-400' : ''}`}
                  >
                    <option value="">Select department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                {errors.department && (
                  <p className="text-sm text-red-600 font-medium tracking-tight">{errors.department.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="role" className="block text-sm font-semibold text-gray-700 tracking-tight">
                  Role
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="role"
                    {...register('role', { required: 'Role is required' })}
                    className={`block w-full pl-12 pr-4 py-3 h-12 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl text-gray-900 focus:bg-white/80 focus:border-orange-300 focus:ring-orange-200 transition-all duration-200 ${errors.role ? 'border-red-300 focus:border-red-400' : ''}`}
                  >
                    <option value="">Select role</option>
                    {roles.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                {errors.role && (
                  <p className="text-sm text-red-600 font-medium tracking-tight">{errors.role.message}</p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 tracking-tight">
                Phone Number <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  className="pl-12 h-12 bg-white/60 backdrop-blur-sm border-gray-200/50 rounded-xl text-gray-900 placeholder:text-gray-500 focus:bg-white/80 focus:border-orange-300 focus:ring-orange-200 transition-all duration-200"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start space-x-3">
              <div className="flex items-center h-5 mt-1">
                <input
                  id="terms"
                  type="checkbox"
                  {...register('terms', { required: 'You must accept the terms and conditions' })}
                  className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded transition-colors"
                />
              </div>
              <div className="text-sm">
                <label htmlFor="terms" className="text-gray-700 font-medium tracking-tight">
                  I agree to the{' '}
                  <Link href="/terms" className="text-orange-600 hover:text-orange-500 font-semibold transition-colors">
                    Terms and Conditions
                  </Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-orange-600 hover:text-orange-500 font-semibold transition-colors">
                    Privacy Policy
                  </Link>
                </label>
                {errors.terms && (
                  <p className="mt-1 text-sm text-red-600 font-medium tracking-tight">{errors.terms.message}</p>
                )}
              </div>
            </div>

            {/* Create Account Button */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-semibold tracking-tight rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Creating account...</span>
                  </div>
                ) : (
                  'Create Account'
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

            {/* Google Sign Up */}
            <div className="flex justify-center">
              <div className="w-full">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 p-3 hover:bg-white/80 transition-all duration-200">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => handleGoogleError('Google sign-in failed')}
                    useOneTap
                    theme="outline"
                    size="large"
                    text="signup_with"
                    shape="rectangular"
                    width="100%"
                  />
                </div>
              </div>
            </div>

            {/* Sign In Link */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-600 font-medium tracking-tight">
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="font-semibold text-orange-600 hover:text-orange-500 transition-colors"
                >
                  Sign in here
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

export default Register