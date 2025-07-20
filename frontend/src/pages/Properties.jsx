import React, { useState } from 'react'
import {
  Home,
  Search,
  Filter,
  Plus,
  MapPin,
  Bed,
  Bath,
  Square,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Loader2
} from 'lucide-react'
import { useProperties, useDeleteProperty } from '../hooks/useProperties'
import AddPropertyModal from '../components/Modals/AddPropertyModal'
import LoadingSpinner from '../components/UI/LoadingSpinner'

const Properties = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)

  // Fetch properties from API
  const { data: properties = [], isLoading, error } = useProperties({
    search: searchTerm,
    type: selectedType === 'all' ? undefined : selectedType
  })

  const { mutate: deleteProperty } = useDeleteProperty()

  const statusColors = {
    available: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    sold: 'bg-gray-100 text-gray-800',
    rented: 'bg-blue-100 text-blue-800'
  }

  const typeColors = {
    apartment: 'bg-blue-100 text-blue-800',
    house: 'bg-green-100 text-green-800',
    villa: 'bg-orange-100 text-orange-800',
    land: 'bg-purple-100 text-purple-800',
    commercial: 'bg-gray-100 text-gray-800'
  }

  const handleDeleteProperty = (propertyId, propertyTitle) => {
    if (window.confirm(`Are you sure you want to delete "${propertyTitle}"?`)) {
      deleteProperty(propertyId)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price) + ' XAF'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading properties..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <Home className="mx-auto h-12 w-12" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading properties</h3>
        <p className="text-gray-600">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your real estate listings and inventory
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary btn-md flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Property</span>
          </button>
        </div>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search properties..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            className="input w-auto"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="condo">Condo</option>
            <option value="villa">Villa</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>
      </div>

      {/* Properties grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <div key={property.id} className="card overflow-hidden">
            {/* Property image */}
            <div className="relative h-48 bg-gray-200">
              <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                <Home className="w-16 h-16 text-primary-400" />
              </div>
              <div className="absolute top-2 left-2 flex space-x-2">
                <span className={`badge ${statusColors[property.status]}`}>
                  {property.status}
                </span>
                <span className={`badge ${typeColors[property.property_type]}`}>
                  {property.property_type}
                </span>
              </div>
              <div className="absolute top-2 right-2">
                <button className="p-1 bg-white rounded-full shadow-sm text-gray-600 hover:text-gray-800">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="card-content">
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{property.title}</h3>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {property.address}, {property.city}
                  </div>
                </div>
                
                <div className="text-2xl font-bold text-primary-600">
                  {formatPrice(property.price)}
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  {property.bedrooms && (
                    <div className="flex items-center">
                      <Bed className="w-4 h-4 mr-1" />
                      {property.bedrooms} bed
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center">
                      <Bath className="w-4 h-4 mr-1" />
                      {property.bathrooms} bath
                    </div>
                  )}
                  {property.area_sqm && (
                    <div className="flex items-center">
                      <Square className="w-4 h-4 mr-1" />
                      {property.area_sqm} m²
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-2">
                  {property.description}
                </p>
                
                <div className="flex flex-wrap gap-1">
                  {property.furnished && (
                    <span className="badge badge-secondary text-xs">Furnished</span>
                  )}
                  {property.parking && (
                    <span className="badge badge-secondary text-xs">Parking</span>
                  )}
                  {property.security && (
                    <span className="badge badge-secondary text-xs">Security</span>
                  )}
                  <span className="badge badge-secondary text-xs">
                    {property.transaction_type === 'sale' ? 'For Sale' : 'For Rent'}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 flex space-x-2">
                <button className="btn btn-outline btn-sm flex items-center space-x-1 flex-1">
                  <Eye className="w-3 h-3" />
                  <span>View</span>
                </button>
                <button className="btn btn-ghost btn-sm">
                  <Edit className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDeleteProperty(property.id, property.title)}
                  className="btn btn-ghost btn-sm text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {properties.length === 0 && (
        <div className="text-center py-12">
          <Home className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No properties found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || selectedType !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding your first property listing.'
            }
          </p>
          {!searchTerm && selectedType === 'all' && (
            <div className="mt-6">
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary btn-md"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Property
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Property Modal */}
      <AddPropertyModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  )
}

export default Properties
