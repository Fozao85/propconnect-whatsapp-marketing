import React, { useState } from 'react'
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
  ChevronRight,
  Activity,
  TrendingUp,
  Heart,
  Eye
} from 'lucide-react'

const CustomerProfile = ({ customer, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedCustomer, setEditedCustomer] = useState(customer)
  const [activeTab, setActiveTab] = useState('overview')

  const handleSave = () => {
    onUpdate(editedCustomer)
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
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'properties', label: 'Properties', icon: Home },
    { id: 'conversations', label: 'Messages', icon: MessageSquare }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
        {/* Mobile-friendly container */}
        {/* Header - Mobile Responsive */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg sm:text-2xl font-bold">
                  {customer.name?.split(' ').map(n => n[0]).join('') || 'N/A'}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl sm:text-2xl font-bold truncate">{customer.name || 'Unknown Customer'}</h2>
                <p className="text-blue-100 text-sm sm:text-base">{customer.phone}</p>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${getStageColor(customer.stage)}`}>
                    {customer.stage?.charAt(0).toUpperCase() + customer.stage?.slice(1)}
                  </span>
                  <span className="text-blue-100 text-xs sm:text-sm">
                    Last contact: {new Date(customer.last_contact_at || customer.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-colors"
                >
                  <Edit className="w-5 h-5" />
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="bg-green-500 hover:bg-green-600 p-2 rounded-lg transition-colors"
                  >
                    <Save className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-red-500 hover:bg-red-600 p-2 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
              <button
                onClick={onClose}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-blue-100 mb-2">
              <span>Lead Progress</span>
              <span>{Math.round(getStageProgress(customer.stage))}% Complete</span>
            </div>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${getStageProgress(customer.stage)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tabs - Mobile Responsive */}
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto px-4 sm:px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.slice(0, 3)}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content - Mobile Responsive */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Contact Information */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{customer.phone}</span>
                    </div>
                    {customer.email && (
                      <div className="flex items-center space-x-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{customer.email}</span>
                      </div>
                    )}
                    {customer.preferred_location && (
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{customer.preferred_location}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">
                        Joined {new Date(customer.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Property Preferences */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Preferences</h3>
                  <div className="space-y-3">
                    {customer.intent && (
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900 capitalize">{customer.intent}</span>
                      </div>
                    )}
                    {customer.property_type && (
                      <div className="flex items-center space-x-3">
                        <Home className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900 capitalize">{customer.property_type}</span>
                      </div>
                    )}
                    {customer.bedrooms && (
                      <div className="flex items-center space-x-3">
                        <span className="w-4 h-4 text-gray-400 text-center">🛏️</span>
                        <span className="text-gray-900">{customer.bedrooms} bedrooms</span>
                      </div>
                    )}
                    {(customer.budget_min || customer.budget_max) && (
                      <div className="flex items-center space-x-3">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">
                          {customer.budget_min && customer.budget_max
                            ? `${formatCurrency(customer.budget_min)} - ${formatCurrency(customer.budget_max)}`
                            : customer.budget_min
                            ? `From ${formatCurrency(customer.budget_min)}`
                            : `Up to ${formatCurrency(customer.budget_max)}`
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <MessageSquare className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-900">12</div>
                    <div className="text-sm text-blue-600">Messages</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <Eye className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-900">5</div>
                    <div className="text-sm text-green-600">Properties Viewed</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <Heart className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-900">3</div>
                    <div className="text-sm text-purple-600">Favorites</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-orange-900">2</div>
                    <div className="text-sm text-orange-600">Days Active</div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Sent message "hello"</span>
                      <span className="text-xs text-gray-400 ml-auto">2 hours ago</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Viewed property listing</span>
                      <span className="text-xs text-gray-400 ml-auto">1 day ago</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Profile created</span>
                      <span className="text-xs text-gray-400 ml-auto">2 days ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Activity Timeline</h3>
              <p className="text-gray-600">Detailed activity timeline coming soon...</p>
            </div>
          )}

          {activeTab === 'properties' && (
            <div className="text-center py-12">
              <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Property Interests</h3>
              <p className="text-gray-600">Property viewing history and favorites coming soon...</p>
            </div>
          )}

          {activeTab === 'conversations' && (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Message History</h3>
              <p className="text-gray-600">Complete conversation history coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CustomerProfile
