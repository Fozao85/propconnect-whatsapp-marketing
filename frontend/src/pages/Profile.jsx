import React, { useState } from 'react'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  Shield,
  Bell,
  Globe
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || 'Demo User',
    email: user?.email || 'demo@propconnect.com',
    phone: '+237 670 337 798',
    location: 'Douala, Cameroon',
    company: 'PropConnect Real Estate',
    role: 'Real Estate Agent',
    bio: 'Experienced real estate professional specializing in residential and commercial properties in Douala and Yaoundé. Helping clients find their dream homes and investment opportunities.',
    joinDate: 'January 2024',
    language: 'English',
    timezone: 'WAT (UTC+1)',
    notifications: {
      email: true,
      whatsapp: true,
      browser: true,
      marketing: false
    }
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleNotificationChange = (type) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type]
      }
    }))
  }

  const handleSave = () => {
    // In a real app, this would make an API call
    toast.success('Profile updated successfully!')
    setIsEditing(false)
  }

  const handleCancel = () => {
    // Reset form data
    setFormData({
      name: user?.name || 'Demo User',
      email: user?.email || 'demo@propconnect.com',
      phone: '+237 670 337 798',
      location: 'Douala, Cameroon',
      company: 'PropConnect Real Estate',
      role: 'Real Estate Agent',
      bio: 'Experienced real estate professional specializing in residential and commercial properties in Douala and Yaoundé.',
      joinDate: 'January 2024',
      language: 'English',
      timezone: 'WAT (UTC+1)',
      notifications: {
        email: true,
        whatsapp: true,
        browser: true,
        marketing: false
      }
    })
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="btn btn-primary btn-md flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="btn btn-ghost btn-md flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSave}
              className="btn btn-primary btn-md flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="card-content text-center py-8">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-white">
                    {formData.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-200">
                    <Camera className="w-4 h-4 text-gray-600" />
                  </button>
                )}
              </div>
              
              <h3 className="mt-4 text-lg font-medium text-gray-900">{formData.name}</h3>
              <p className="text-sm text-gray-600">{formData.role}</p>
              <p className="text-sm text-gray-500">{formData.company}</p>
              
              <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                Joined {formData.joinDate}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Basic Information</h3>
            </div>
            <div className="card-content space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User className="w-4 h-4 inline mr-1" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input"
                    />
                  ) : (
                    <p className="text-gray-900">{formData.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input"
                    />
                  ) : (
                    <p className="text-gray-900">{formData.email}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="input"
                    />
                  ) : (
                    <p className="text-gray-900">{formData.phone}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Location
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="input"
                    />
                  ) : (
                    <p className="text-gray-900">{formData.location}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows="3"
                    className="input"
                  />
                ) : (
                  <p className="text-gray-900">{formData.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Professional Information</h3>
            </div>
            <div className="card-content space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Building className="w-4 h-4 inline mr-1" />
                    Company
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="input"
                    />
                  ) : (
                    <p className="text-gray-900">{formData.company}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="input"
                    />
                  ) : (
                    <p className="text-gray-900">{formData.role}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Preferences</h3>
            </div>
            <div className="card-content space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Globe className="w-4 h-4 inline mr-1" />
                    Language
                  </label>
                  {isEditing ? (
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      className="input"
                    >
                      <option value="English">English</option>
                      <option value="French">Français</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{formData.language}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timezone
                  </label>
                  {isEditing ? (
                    <select
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleInputChange}
                      className="input"
                    >
                      <option value="WAT (UTC+1)">WAT (UTC+1)</option>
                      <option value="GMT (UTC+0)">GMT (UTC+0)</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{formData.timezone}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Bell className="w-4 h-4 inline mr-1" />
                Notification Settings
              </h3>
            </div>
            <div className="card-content space-y-4">
              {Object.entries(formData.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {key === 'whatsapp' ? 'WhatsApp' : key} Notifications
                    </p>
                    <p className="text-xs text-gray-500">
                      {key === 'email' && 'Receive notifications via email'}
                      {key === 'whatsapp' && 'Receive notifications via WhatsApp'}
                      {key === 'browser' && 'Show browser notifications'}
                      {key === 'marketing' && 'Receive marketing updates'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange(key)}
                    disabled={!isEditing}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value ? 'bg-primary-600' : 'bg-gray-200'
                    } ${!isEditing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
