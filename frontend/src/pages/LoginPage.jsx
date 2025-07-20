import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Smartphone, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import clsx from 'clsx'

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const { login, register: registerUser, isLoading } = useAuthStore()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm()

  const onSubmit = async (data) => {
    if (isRegistering) {
      const result = await registerUser(data)
      if (result.success) {
        reset()
      }
    } else {
      const result = await login(data.email, data.password)
      if (result.success) {
        reset()
      }
    }
  }

  const toggleMode = () => {
    setIsRegistering(!isRegistering)
    reset()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 shadow-lg">
              <Smartphone className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {isRegistering ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isRegistering 
              ? 'Start your WhatsApp real estate marketing journey'
              : 'Sign in to your PropConnect account'
            }
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Registration fields */}
            {isRegistering && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    {...register('firstName', { 
                      required: 'First name is required',
                      minLength: { value: 2, message: 'First name must be at least 2 characters' }
                    })}
                    type="text"
                    className={clsx('input mt-1', errors.firstName && 'input-error')}
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-danger-600">{errors.firstName.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    {...register('lastName', { 
                      required: 'Last name is required',
                      minLength: { value: 2, message: 'Last name must be at least 2 characters' }
                    })}
                    type="text"
                    className={clsx('input mt-1', errors.lastName && 'input-error')}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-danger-600">{errors.lastName.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                type="email"
                className={clsx('input mt-1', errors.email && 'input-error')}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-danger-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className={clsx('input pr-10', errors.password && 'input-error')}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-danger-600">{errors.password.message}</p>
              )}
            </div>

            {/* Company (registration only) */}
            {isRegistering && (
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                  Company <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  {...register('company')}
                  type="text"
                  className="input mt-1"
                  placeholder="Your Real Estate Company"
                />
              </div>
            )}
          </div>

          {/* Submit button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-lg w-full"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {isRegistering ? 'Create Account' : 'Sign In'}
            </button>
          </div>

          {/* Toggle mode */}
          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-primary-600 hover:text-primary-500 font-medium"
            >
              {isRegistering 
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"
              }
            </button>
          </div>
        </form>

        {/* Demo credentials */}
        {!isRegistering && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              <strong>Demo credentials:</strong><br />
              Email: demo@propconnect.com<br />
              Password: demo123
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default LoginPage
