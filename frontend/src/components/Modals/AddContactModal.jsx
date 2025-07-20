import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { X, User, Phone, Mail, MapPin, DollarSign, Home, Calendar } from 'lucide-react'
import { useCreateContact } from '../../hooks/useContacts'
import clsx from 'clsx'

const AddContactModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const { mutate: createContact, isPending } = useCreateContact()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm()

  const onSubmit = async (data) => {
    // Convert budget strings to numbers
    const contactData = {
      ...data,
      budget_min: data.budget_min ? parseInt(data.budget_min) : null,
      budget_max: data.budget_max ? parseInt(data.budget_max) : null,
      bedrooms: data.bedrooms ? parseInt(data.bedrooms) : null,
      move_in_date: data.move_in_date || null
    }
    
    createContact(contactData, {
      onSuccess: () => {
        reset()
        setCurrentStep(1)
        onClose()
      }
    })
  }

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
        
        <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Add New Contact</h3>
              <p className="text-sm text-gray-600">Step {currentStep} of 3</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={clsx(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                    step <= currentStep
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  )}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={clsx(
                      'w-16 h-1 mx-2',
                      step < currentStep ? 'bg-primary-600' : 'bg-gray-200'
                    )} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>Basic Info</span>
              <span>Preferences</span>
              <span>Additional</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-6">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <User className="w-4 h-4 inline mr-1" />
                        Full Name *
                      </label>
                      <input
                        {...register('name', { required: 'Name is required' })}
                        className={clsx('input', errors.name && 'input-error')}
                        placeholder="John Doe"
                      />
                      {errors.name && (
                        <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Phone Number *
                      </label>
                      <input
                        {...register('phone', { 
                          required: 'Phone number is required',
                          pattern: {
                            value: /^\+?[1-9]\d{1,14}$/,
                            message: 'Invalid phone number format'
                          }
                        })}
                        className={clsx('input', errors.phone && 'input-error')}
                        placeholder="+237670337798"
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email Address
                    </label>
                    <input
                      {...register('email', {
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      className={clsx('input', errors.email && 'input-error')}
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Intent
                      </label>
                      <select {...register('intent')} className="input">
                        <option value="">Select intent</option>
                        <option value="buy">Buy</option>
                        <option value="rent">Rent</option>
                        <option value="invest">Invest</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Source
                      </label>
                      <select {...register('source')} className="input">
                        <option value="">Select source</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="website">Website</option>
                        <option value="facebook_ad">Facebook Ad</option>
                        <option value="referral">Referral</option>
                        <option value="qr_code">QR Code</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Property Preferences */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <DollarSign className="w-4 h-4 inline mr-1" />
                        Min Budget (XAF)
                      </label>
                      <input
                        {...register('budget_min')}
                        type="number"
                        className="input"
                        placeholder="50000000"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <DollarSign className="w-4 h-4 inline mr-1" />
                        Max Budget (XAF)
                      </label>
                      <input
                        {...register('budget_max')}
                        type="number"
                        className="input"
                        placeholder="100000000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Preferred Location
                    </label>
                    <input
                      {...register('preferred_location')}
                      className="input"
                      placeholder="Douala, Akwa"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Home className="w-4 h-4 inline mr-1" />
                        Property Type
                      </label>
                      <select {...register('property_type')} className="input">
                        <option value="">Select type</option>
                        <option value="apartment">Apartment</option>
                        <option value="house">House</option>
                        <option value="villa">Villa</option>
                        <option value="land">Land</option>
                        <option value="commercial">Commercial</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bedrooms
                      </label>
                      <select {...register('bedrooms')} className="input">
                        <option value="">Any</option>
                        <option value="1">1 Bedroom</option>
                        <option value="2">2 Bedrooms</option>
                        <option value="3">3 Bedrooms</option>
                        <option value="4">4 Bedrooms</option>
                        <option value="5">5+ Bedrooms</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Additional Information */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Preferred Move-in Date
                    </label>
                    <input
                      {...register('move_in_date')}
                      type="date"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stage
                    </label>
                    <select {...register('stage')} className="input">
                      <option value="new">New Lead</option>
                      <option value="qualified">Qualified</option>
                      <option value="viewing">Viewing</option>
                      <option value="negotiating">Negotiating</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      {...register('notes')}
                      className="input"
                      rows="3"
                      placeholder="Additional notes about this contact..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="btn btn-outline btn-md"
                  >
                    Previous
                  </button>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-ghost btn-md"
                >
                  Cancel
                </button>
                
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="btn btn-primary btn-md"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isPending}
                    className="btn btn-primary btn-md"
                  >
                    {isPending ? 'Creating...' : 'Create Contact'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddContactModal
