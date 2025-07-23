import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  MessageSquare, 
  Home, 
  DollarSign,
  Clock,
  Star,
  Edit,
  Save,
  X,
  ChevronLeft,
  Activity,
  TrendingUp,
  Heart,
  Eye,
  ArrowLeft
} from 'lucide-react'
import { useCustomer, useUpdateCustomer } from '../hooks/useCustomer'
import LoadingSpinner from '../components/UI/LoadingSpinner'

const CustomerProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Fetch customer data
  const { data: customer, isLoading, error } = useCustomer(id)
  const { mutate: updateCustomer } = useUpdateCustomer()

  const [editedCustomer, setEditedCustomer] = useState(customer || {})

  // Update editedCustomer when customer data loads
  React.useEffect(() => {
    if (customer) {
      setEditedCustomer(customer)
    }
  }, [customer])

  const handleSave = () => {
    updateCustomer(editedCustomer)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedCustomer(customer)
    setIsEditing(false)
  }

  const getStageColor = (stage) => {
    const colors = {
      'new': 'bg-blue-100 text-blue-800',
      'contacted': 'bg-yellow-100 text-yellow-800',
      'qualified': 'bg-purple-100 text-purple-800',
      'viewing': 'bg-orange-100 text-orange-800',
      'negotiating': 'bg-red-100 text-red-800',
      'closed': 'bg-green-100 text-green-800',
      'lost': 'bg-gray-100 text-gray-800'
    }
    return colors[stage] || 'bg-gray-100 text-gray-800'
  }

  const getStageProgress = (stage) => {
    const stages = ['new', 'contacted', 'qualified', 'viewing', 'negotiating', 'closed']
    const currentIndex = stages.indexOf(stage)
    return ((currentIndex + 1) / stages.length) * 100
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'activity', label: 'Activity Timeline', icon: Activity },
    { id: 'properties', label: 'Property Interests', icon: Home },
    { id: 'conversations', label: 'Messages', icon: MessageSquare },
    { id: 'documents', label: 'Documents', icon: Star },
    { id: 'appointments', label: 'Appointments', icon: Calendar }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading customer profile..." />
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Not Found</h2>
          <p className="text-gray-600 mb-4">The customer profile you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/contacts')}
            className="btn btn-primary"
          >
            Back to Contacts
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back button and title */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/contacts')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back to Contacts</span>
              </button>
              <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>
              <h1 className="text-xl font-semibold text-gray-900">Customer Profile</h1>
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-outline flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="btn btn-primary flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span className="hidden sm:inline">Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="btn btn-outline flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">Cancel</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            {/* Customer Info */}
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-3xl font-bold">
                  {customer.name?.split(' ').map(n => n[0]).join('') || 'N/A'}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-3xl font-bold truncate">{customer.name || 'Unknown Customer'}</h2>
                <p className="text-blue-100 text-lg">{customer.phone}</p>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStageColor(customer.stage)}`}>
                    {customer.stage?.charAt(0).toUpperCase() + customer.stage?.slice(1)}
                  </span>
                  <span className="text-blue-100 text-sm">
                    Last contact: {new Date(customer.last_contact_at || customer.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold">12</div>
                <div className="text-sm text-blue-100">Messages</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">5</div>
                <div className="text-sm text-blue-100">Properties</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">3</div>
                <div className="text-sm text-blue-100">Favorites</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">2</div>
                <div className="text-sm text-blue-100">Days Active</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-8">
            <div className="flex justify-between text-sm text-blue-100 mb-2">
              <span>Lead Progress</span>
              <span>{Math.round(getStageProgress(customer.stage))}% Complete</span>
            </div>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
              <div 
                className="bg-white h-3 rounded-full transition-all duration-300"
                style={{ width: `${getStageProgress(customer.stage)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-6 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Contact Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Details Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Phone</div>
                      <div className="font-medium">{customer.phone}</div>
                    </div>
                  </div>
                  {customer.email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Email</div>
                        <div className="font-medium">{customer.email}</div>
                      </div>
                    </div>
                  )}
                  {customer.preferred_location && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Preferred Location</div>
                        <div className="font-medium">{customer.preferred_location}</div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Customer Since</div>
                      <div className="font-medium">
                        {new Date(customer.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Property Preferences Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customer.intent && (
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Intent</div>
                        <div className="font-medium capitalize">{customer.intent}</div>
                      </div>
                    </div>
                  )}
                  {customer.property_type && (
                    <div className="flex items-center space-x-3">
                      <Home className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Property Type</div>
                        <div className="font-medium capitalize">{customer.property_type}</div>
                      </div>
                    </div>
                  )}
                  {customer.bedrooms && (
                    <div className="flex items-center space-x-3">
                      <span className="w-5 h-5 text-gray-400 text-center">🛏️</span>
                      <div>
                        <div className="text-sm text-gray-500">Bedrooms</div>
                        <div className="font-medium">{customer.bedrooms} bedrooms</div>
                      </div>
                    </div>
                  )}
                  {(customer.budget_min || customer.budget_max) && (
                    <div className="flex items-center space-x-3">
                      <DollarSign className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Budget Range</div>
                        <div className="font-medium">
                          {customer.budget_min && customer.budget_max
                            ? `${formatCurrency(customer.budget_min)} - ${formatCurrency(customer.budget_max)}`
                            : customer.budget_min
                            ? `From ${formatCurrency(customer.budget_min)}`
                            : `Up to ${formatCurrency(customer.budget_max)}`
                          }
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Activity & Stats */}
            <div className="space-y-6">
              {/* Recent Activity Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">Sent message "hello"</div>
                      <div className="text-xs text-gray-500">2 hours ago</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">Viewed property listing</div>
                      <div className="text-xs text-gray-500">1 day ago</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">Profile created</div>
                      <div className="text-xs text-gray-500">2 days ago</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Engagement Stats Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Response Rate</span>
                    <span className="text-sm font-medium text-green-600">85%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg Response Time</span>
                    <span className="text-sm font-medium text-blue-600">2.5 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Lead Score</span>
                    <span className="text-sm font-medium text-purple-600">78/100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Conversion Probability</span>
                    <span className="text-sm font-medium text-orange-600">High</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tab contents */}
        {activeTab !== 'overview' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-4">
              {activeTab === 'activity' && <Activity className="w-12 h-12 mx-auto" />}
              {activeTab === 'properties' && <Home className="w-12 h-12 mx-auto" />}
              {activeTab === 'conversations' && <MessageSquare className="w-12 h-12 mx-auto" />}
              {activeTab === 'documents' && <Star className="w-12 h-12 mx-auto" />}
              {activeTab === 'appointments' && <Calendar className="w-12 h-12 mx-auto" />}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2 capitalize">{activeTab}</h3>
            <p className="text-gray-600">This section is coming soon...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomerProfile
