import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { X, Home, DollarSign, MapPin, Bed, Bath, Square } from 'lucide-react'
import { useCreateProperty } from '../../hooks/useProperties'
import clsx from 'clsx'

const AddPropertyModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const { mutate: createProperty, isPending } = useCreateProperty()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm()

  const onSubmit = async (data) => {
    // Convert string numbers to integers
    const propertyData = {
      ...data,
      price: parseInt(data.price),
      bedrooms: data.bedrooms ? parseInt(data.bedrooms) : null,
      bathrooms: data.bathrooms ? parseInt(data.bathrooms) : null,
      area_sqm: data.area_sqm ? parseInt(data.area_sqm) : null,
      furnished: data.furnished === 'true',
      parking: data.parking === 'true',
      security: data.security === 'true'
    }
    
    createProperty(propertyData, {
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
              <h3 className="text-lg font-semibold text-gray-900">Add New Property</h3>
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
              <span>Details</span>
              <span>Features</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-6">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Home className="w-4 h-4 inline mr-1" />
                      Property Title *
                    </label>
                    <input
                      {...register('title', { required: 'Property title is required' })}
                      className={clsx('input', errors.title && 'input-error')}
                      placeholder="Beautiful 3-bedroom apartment in Akwa"
                    />
                    {errors.title && (
                      <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      {...register('description')}
                      className="input"
                      rows="3"
                      placeholder="Describe the property features, location, and unique selling points..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Property Type *
                      </label>
                      <select 
                        {...register('property_type', { required: 'Property type is required' })}
                        className={clsx('input', errors.property_type && 'input-error')}
                      >
                        <option value="">Select type</option>
                        <option value="apartment">Apartment</option>
                        <option value="house">House</option>
                        <option value="villa">Villa</option>
                        <option value="land">Land</option>
                        <option value="commercial">Commercial</option>
                      </select>
                      {errors.property_type && (
                        <p className="text-sm text-red-600 mt-1">{errors.property_type.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Transaction Type *
                      </label>
                      <select 
                        {...register('transaction_type', { required: 'Transaction type is required' })}
                        className={clsx('input', errors.transaction_type && 'input-error')}
                      >
                        <option value="">Select type</option>
                        <option value="sale">For Sale</option>
                        <option value="rent">For Rent</option>
                      </select>
                      {errors.transaction_type && (
                        <p className="text-sm text-red-600 mt-1">{errors.transaction_type.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Price (XAF) *
                    </label>
                    <input
                      {...register('price', { 
                        required: 'Price is required',
                        min: { value: 1, message: 'Price must be greater than 0' }
                      })}
                      type="number"
                      className={clsx('input', errors.price && 'input-error')}
                      placeholder="50000000"
                    />
                    {errors.price && (
                      <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Location & Details */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Address *
                    </label>
                    <input
                      {...register('address', { required: 'Address is required' })}
                      className={clsx('input', errors.address && 'input-error')}
                      placeholder="Boulevard de la Liberté, Akwa"
                    />
                    {errors.address && (
                      <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <select 
                        {...register('city', { required: 'City is required' })}
                        className={clsx('input', errors.city && 'input-error')}
                      >
                        <option value="">Select city</option>
                        <option value="Douala">Douala</option>
                        <option value="Yaoundé">Yaoundé</option>
                        <option value="Bafoussam">Bafoussam</option>
                        <option value="Bamenda">Bamenda</option>
                        <option value="Garoua">Garoua</option>
                        <option value="Maroua">Maroua</option>
                        <option value="Ngaoundéré">Ngaoundéré</option>
                      </select>
                      {errors.city && (
                        <p className="text-sm text-red-600 mt-1">{errors.city.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Region
                      </label>
                      <select {...register('region')} className="input">
                        <option value="">Select region</option>
                        <option value="Littoral">Littoral</option>
                        <option value="Centre">Centre</option>
                        <option value="Ouest">Ouest</option>
                        <option value="Nord-Ouest">Nord-Ouest</option>
                        <option value="Nord">Nord</option>
                        <option value="Extrême-Nord">Extrême-Nord</option>
                        <option value="Adamaoua">Adamaoua</option>
                        <option value="Est">Est</option>
                        <option value="Sud">Sud</option>
                        <option value="Sud-Ouest">Sud-Ouest</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Bed className="w-4 h-4 inline mr-1" />
                        Bedrooms
                      </label>
                      <input
                        {...register('bedrooms')}
                        type="number"
                        min="0"
                        className="input"
                        placeholder="3"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Bath className="w-4 h-4 inline mr-1" />
                        Bathrooms
                      </label>
                      <input
                        {...register('bathrooms')}
                        type="number"
                        min="0"
                        className="input"
                        placeholder="2"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Square className="w-4 h-4 inline mr-1" />
                        Area (m²)
                      </label>
                      <input
                        {...register('area_sqm')}
                        type="number"
                        min="0"
                        className="input"
                        placeholder="120"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Features */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Property Features
                    </label>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <input
                          {...register('furnished')}
                          type="checkbox"
                          value="true"
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <label className="text-sm text-gray-700">Furnished</label>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <input
                          {...register('parking')}
                          type="checkbox"
                          value="true"
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <label className="text-sm text-gray-700">Parking Available</label>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <input
                          {...register('security')}
                          type="checkbox"
                          value="true"
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <label className="text-sm text-gray-700">Security</label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select {...register('status')} className="input">
                      <option value="available">Available</option>
                      <option value="pending">Pending</option>
                      <option value="sold">Sold</option>
                      <option value="rented">Rented</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Notes
                    </label>
                    <textarea
                      {...register('notes')}
                      className="input"
                      rows="3"
                      placeholder="Any additional information about the property..."
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
                    {isPending ? 'Creating...' : 'Create Property'}
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

export default AddPropertyModal
