import React, { useState } from 'react'
import { X, Home, Search, Send } from 'lucide-react'
import { useProperties } from '../../hooks/useProperties'
import { useSendProperty } from '../../hooks/useConversations'
import LoadingSpinner from '../UI/LoadingSpinner'

const PropertySelectorModal = ({ isOpen, onClose, contactId, contactName }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [customMessage, setCustomMessage] = useState('')
  
  const { data: properties = [], isLoading } = useProperties({
    search: searchTerm
  })
  
  const { mutate: sendProperty, isPending } = useSendProperty()

  const handleSendProperty = () => {
    if (selectedProperty) {
      sendProperty({
        contactId,
        propertyId: selectedProperty.id,
        message: customMessage.trim() || undefined
      }, {
        onSuccess: () => {
          setSelectedProperty(null)
          setCustomMessage('')
          onClose()
        }
      })
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price) + ' XAF'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
        
        <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Send Property</h3>
              <p className="text-sm text-gray-600">Send property details to {contactName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Properties Grid */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Select a property:</h4>
              
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="md" text="Loading properties..." />
                </div>
              ) : properties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                  {properties.map((property) => (
                    <div
                      key={property.id}
                      onClick={() => setSelectedProperty(property)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedProperty?.id === property.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Home className="w-6 h-6 text-primary-600" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-medium text-gray-900 truncate">
                            {property.title}
                          </h5>
                          <p className="text-xs text-gray-500 truncate">
                            {property.address}, {property.city}
                          </p>
                          <p className="text-sm font-semibold text-primary-600 mt-1">
                            {formatPrice(property.price)}
                          </p>
                          
                          <div className="flex items-center space-x-2 mt-2">
                            {property.bedrooms && (
                              <span className="text-xs text-gray-500">
                                {property.bedrooms} bed
                              </span>
                            )}
                            {property.bathrooms && (
                              <span className="text-xs text-gray-500">
                                {property.bathrooms} bath
                              </span>
                            )}
                            {property.area_sqm && (
                              <span className="text-xs text-gray-500">
                                {property.area_sqm} m²
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Home className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No properties found</p>
                </div>
              )}
            </div>

            {/* Custom Message */}
            {selectedProperty && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom message (optional)
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Add a personal message with the property details..."
                  className="input"
                  rows="3"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to use the default property details message
                </p>
              </div>
            )}

            {/* Selected Property Preview */}
            {selectedProperty && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h5 className="text-sm font-medium text-gray-900 mb-2">Selected Property:</h5>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                    <Home className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{selectedProperty.title}</p>
                    <p className="text-xs text-gray-500">{formatPrice(selectedProperty.price)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="btn btn-ghost btn-md"
            >
              Cancel
            </button>
            
            <button
              onClick={handleSendProperty}
              disabled={!selectedProperty || isPending}
              className="btn btn-primary btn-md flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{isPending ? 'Sending...' : 'Send Property'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertySelectorModal
